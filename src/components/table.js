import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    root.beforeClones = [];
    for (let i = before.length - 1; i >= 0; i--) {
        const block = cloneTemplate(before[i]);
        root.container.prepend(block.container);
        root.beforeClones.unshift(block);
        root[before[i]] = block;
    }

    root.afterClones = after.map((id) => {
        const block = cloneTemplate(id);
        root[id] = block;
        return block;
    });
    if (root.afterClones.length) {
        root.elements.rows.after(...root.afterClones.map((b) => b.container));
    }

    root.container.addEventListener('change', () => {
        onAction();
    });
    root.container.addEventListener('reset', () => {
        setTimeout(onAction);
    });
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach((key)=> {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });
            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}