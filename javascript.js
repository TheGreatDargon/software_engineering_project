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

headers = document.getElementsByClassName("table-header");

for (let i = 0; i < headers.length; i++) {
    document.getElementsByClassName("table-header")[i].addEventListener("click", function () {
        setAriaSortAttributes(headers, i);
        console.log("Clicked header index: " + i);
    });
};
