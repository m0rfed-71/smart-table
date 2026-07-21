import {makeIndex} from "./lib/utils.js";
import {sortCollection} from "./lib/sort.js";

export function initData(sourceData) {
    const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
    const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
    const data = sourceData.purchase_records.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    let lastResult;
    let lastQuery;

    const applyQuery = (query = {}) => {
        let items = [...data];

        if (query.search) {
            const term = String(query.search).toLowerCase();
            items = items.filter(row =>
                ['date', 'customer', 'seller', 'total']
                    .some(key => String(row[key]).toLowerCase().includes(term))
            );
        }

        for (const [key, value] of Object.entries(query)) {
            const match = key.match(/^filter\[(.+)\]$/);
            if (!match || value === '' || value == null) continue;

            const field = match[1];
            if (field === 'totalFrom') {
                const from = parseFloat(value);
                if (!Number.isNaN(from)) items = items.filter(row => row.total >= from);
            } else if (field === 'totalTo') {
                const to = parseFloat(value);
                if (!Number.isNaN(to)) items = items.filter(row => row.total <= to);
            } else {
                const needle = String(value).toLowerCase();
                items = items.filter(row => String(row[field]).toLowerCase().includes(needle));
            }
        }

        if (query.sort) {
            const [field, order] = String(query.sort).split(':');
            items = sortCollection(items, field, order);
        }

        const total = items.length;
        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 10;
        const start = (page - 1) * limit;

        return {
            total,
            items: items.slice(start, start + limit)
        };
    };

    const getIndexes = async () => ({ sellers, customers });

    const getRecords = async (query = {}, isUpdated = false) => {
        const nextQuery = new URLSearchParams(query).toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        lastQuery = nextQuery;
        lastResult = applyQuery(query);
        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}
