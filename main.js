'use strict';

let firstCellClicks = 0;

const headerElement = document.querySelector('.header');
const searchButton = document.querySelector('.searchbar__button');
const searchInput = document.querySelector('.searchbar__input');
const chosenCarElement = document.querySelector('.chosen-car');

const getData = (onSuccess, onError) => {
  fetch('https://city-mobil.ru/api/cars')
    .then((response) => response.json())
    .then((stays) => onSuccess(stays))
    .catch((err) => onError(err));
};


const onCellClick = (chosenText, rowElement) => {
  const rowPressed = document.querySelectorAll('.data__row--pressed');
  rowPressed.forEach(row => row.classList.remove('data__row--pressed'));
  chosenCarElement.textContent = chosenText;
  rowElement.classList.add('data__row--pressed');
};

const pasteData = (data, cars) => {
  headerElement.textContent = 'header';
  const tariffs = data.tariffs_list;
  const tableCarsElement = document.querySelector('.data__table-cars');

  tableCarsElement.innerHTML = '';

  const tableHeadeElement = document.querySelector('.data__table-head');
  tableHeadeElement.innerHTML = '';

  const tableHeadFirstCell = document.createElement('th');
  tableHeadFirstCell.classList.add('data__first-column');
  tableHeadFirstCell.classList.add('data__first-column--head');
  tableHeadFirstCell.textContent = 'Марка и модель';
  tableHeadeElement.appendChild(tableHeadFirstCell);

  tableHeadFirstCell.addEventListener('click', () => {
    firstCellClicks ++;

    if (firstCellClicks % 2 === 0) {
      cars.sort(function(a, b) {
        if (`${a.mark} ${a.model}` > `${b.mark} ${b.model}`) {
          return 1; }
        if (`${a.mark} ${a.model}` < `${b.mark} ${b.model}`) {
          return -1; }
        return 0;
      });
    } else {
      cars.sort(function(a, b) {
        if (`${a.mark} ${a.model}` > `${b.mark} ${b.model}`) {
          return -1; }
        if (`${a.mark} ${a.model}` < `${b.mark} ${b.model}`) {
          return 1; }
        return 0;
      });
    }

    pasteData (data, cars);
  });

  tariffs.forEach(tariff => {
    const sortedCars = cars;
    const tableHeadDataElement = document.createElement('th');
    tableHeadDataElement.textContent = tariff;
    tableHeadeElement.appendChild(tableHeadDataElement);
    tableHeadDataElement.style.cursor = 'pointer';

    tableHeadDataElement.addEventListener('click', () => {

      sortedCars.forEach(car => {
        if (!car.tariffs[tariff]) {
          car.tariffs[tariff] = {'year': 0};
        }
      });

      sortedCars.sort(function(a, b) {
        if (a.tariffs[tariff].year > b.tariffs[tariff].year) {
          return 1; }
        if (a.tariffs[tariff].year < b.tariffs[tariff].year) {
          return -1; }
        return 0;
      });

      cars.forEach(car => {
        if (car.tariffs[tariff].year === 0) {
          car.tariffs[tariff] = {'year': '-'};
        }
      });

      pasteData (data, sortedCars.reverse());
    });
  });
  cars.forEach(car => {
    const tableRowElement = document.createElement('tr');
    const tableFirstCellElement = document.createElement('td');
    tableFirstCellElement.classList.add('data__first-column');
    tableFirstCellElement.textContent = car.mark + ' ' + car.model;
    tableFirstCellElement.addEventListener('click', (evt) => {
      onCellClick (`Выбран автомобиль ${evt.target.textContent}`, tableRowElement);
    });
    tableRowElement.appendChild(tableFirstCellElement);
    tariffs.forEach(tariff => {
      const tableOtherCellElement = document.createElement('td');
      if (car.tariffs[tariff]) {
        tableOtherCellElement.textContent = car.tariffs[tariff].year;
        tableOtherCellElement.addEventListener('click', (evt) => {
          onCellClick (`Выбран автомобиль ${tableFirstCellElement.textContent} ${evt.target.textContent} года выпуска`, tableRowElement);
        });
      } else {
        tableOtherCellElement.textContent = '-';
      }
      tableRowElement.appendChild(tableOtherCellElement);
    });
    tableCarsElement.appendChild(tableRowElement);
  });
};

const checkTariffes = (tariffes) => {
  let result = 0;
  for (let i = 0; i < tariffes.length; i++) {
    if (tariffes[i].year.toString().includes(searchInput.value)) {
      result++;
    }
  }
  return result > 0 ? true : false;
};

const onSearchButtonClick = (data) => {
  const finalCars = data.cars.filter(car => car.mark.toLowerCase().includes(searchInput.value.toLowerCase()) || car.model.toLowerCase().includes(searchInput.value.toLowerCase()) || checkTariffes(Object.values(car.tariffs)));

  pasteData (data, finalCars);
};

const showError = () => {
  headerElement.textContent = 'Произошла ошибка при загрузке данных. Попробуйте ещё раз';
};

getData((data) => {
  pasteData (data, data.cars);
  searchButton.addEventListener('click', () => onSearchButtonClick(data));
},showError);