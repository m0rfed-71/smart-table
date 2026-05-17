import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage=parseInt(state.rowsPerPage);
    const page=parseInt(state.page ?? 1);
    return {
        ...state,
        rowsPerPage,
        page,
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let result = [...data]; // копируем для последующего изменения
    // @todo: использование
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);
    result = applyFiltering(result, state, action);
    sampleTable.render(result)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['header','filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const filterBlock = sampleTable.beforeClones[1];
const applyFiltering = initFiltering(filterBlock.elements, {
    searchBySeller: indexes.sellers 
});

const paginationBlock = sampleTable.afterClones[0];
const applyPagination = initPagination(
    paginationBlock.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);
const headerBlock = sampleTable.beforeClones[0];
const applySorting = initSorting ([
    headerBlock.elements.sortByDate,
    headerBlock.elements.sortByTotal,
])

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();
