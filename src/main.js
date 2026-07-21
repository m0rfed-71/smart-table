import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Исходные данные используемые в render()
const API = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page) || 1;
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
let lastFiltersQuery = '';

async function render(action) {
    let state = collectState();
    let query = {};
    // @todo: использование
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);

    // поиск/фильтры изменились — всегда с первой страницы
    const filtersQuery = JSON.stringify(query);
    if (filtersQuery !== lastFiltersQuery) {
        state.page = 1;
        lastFiltersQuery = filtersQuery;
    }

    query = applyPagination(query, state, action);
    const {total, items} = await API.getRecords(query);

    state.page = Number(query.page);
    state.rowsPerPage = Number(query.limit);
    updatePagination(total, state);
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search','header','filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const searchBlock = sampleTable.beforeClones[0];
const headerBlock = sampleTable.beforeClones[1];
const filterBlock = sampleTable.beforeClones[2];
const applySearching = initSearching('search');
//const applyFiltering = initFiltering(filterBlock.elements, {
//    searchBySeller: indexes.sellers
//});

const paginationBlock = sampleTable.afterClones[0];
const {applyPagination, updatePagination} = initPagination(
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

const {applyFiltering, updateIndexes} = initFiltering(filterBlock.elements);

const applySorting = initSorting ([
    headerBlock.elements.sortByDate,
    headerBlock.elements.sortByTotal,
])

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);
async function init() {
    const indexes = await API.getIndexes();

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

init().then(render);
