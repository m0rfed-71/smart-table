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
    const rowsPerPage = parseInt(state.rowsPerPage ?? '10', 10) || 10;
    const page = parseInt(state.page ?? 1, 10) || 1;
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
/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
let lastFiltersQuery = '';

async function render(action) {
    try {
        const state = collectState();
        let query = {};

        query = applySearching(query, state, action);
        query = applyFiltering(query, state, action);
        query = applySorting(query, state, action);

        const filtersQuery = JSON.stringify(query);
        if (filtersQuery !== lastFiltersQuery) {
            state.page = 1;
            lastFiltersQuery = filtersQuery;
        }

        query = applyPagination(query, state, action);

        const {total, items} = await API.getRecords(query);
        updatePagination(total, query);
        sampleTable.render(items);
    } catch (error) {
        console.error('Failed to render table', error);
    }
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const applySearching = initSearching('search');
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal,
]);
const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);
const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

async function init() {
    try {
        const indexes = await API.getIndexes();
        updateIndexes({
            searchBySeller: indexes.sellers
        });
    } catch (error) {
        console.error('Failed to init indexes', error);
    }

    await render();
}

init();
