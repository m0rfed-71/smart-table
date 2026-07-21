export function initFiltering(elements) {
    const updateIndexes = (indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const target = elements[elementName];
            if (!target) return;

            const defaultOption = target.querySelector('option[value=""]')?.cloneNode(true);
            const options = Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            });

            target.replaceChildren(...[defaultOption, ...options].filter(Boolean));
        });
    };

    const applyFiltering = (query, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const control = action.form?.elements?.namedItem(field);

            if (control) {
                control.value = '';
            }
            if (field) {
                state[field] = '';
            }
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            const el = elements[key];
            if (!el) return;

            if (['INPUT', 'SELECT'].includes(el.tagName) && el.value) {
                filter[`filter[${el.name}]`] = el.value;
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        applyFiltering,
        updateIndexes
    };
}
