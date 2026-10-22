function setAriaSortAttributes(headers, index) {
    for (let i = 0; i < headers.length; i++) {
        if (index != i) {
            headers[i].setAttribute("aria-sort", "none");
        }
        else if (headers[i].getAttribute("aria-sort") == "ascending") {
            headers[i].setAttribute("aria-sort", "descending");
        }
        else {
            headers[i].setAttribute("aria-sort", "ascending");
        }
    };
}

function sortTableByColumn(table, columnIndex, ascending) {
    const direction = ascending ? 1 : -1;
    const theaders = Array.from(table.querySelectorAll('th.table-header'));
    const rows = Array.from(table.querySelectorAll("tr:nth-child(n+2)"));
    const rowsToDelete = table.querySelectorAll('tr.table-row');
    const sortedRows = rows.sort((a, b) => {
        a = a.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
        b = b.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
        return a > b ? (1 * direction) : (-1 * direction);
    });
    rowsToDelete.forEach(row => row.remove());
    table.replaceChildren(...theaders, ...sortedRows);
}

headers = document.getElementsByClassName("table-header");

for (let i = 0; i < headers.length; i++) {
    document.getElementsByClassName("table-header")[i].addEventListener("click", function () {
        setAriaSortAttributes(headers, i);
        const tableElement = document.getElementsByClassName("table")[0];
        const currentIsAscending = this.getAttribute("aria-sort") === "ascending";
        sortTableByColumn(tableElement, i, !currentIsAscending);
    });
};
