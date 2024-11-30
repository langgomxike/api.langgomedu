export default class Pagination {
    public page: number;
    public per_page: number;
    public total_pages: number;
    public total_items: number;

    constructor(page = 1, per_page = 10, total_pages = 1, total_items = 0) {
        this.page = page;
        this.per_page = per_page;
        this.total_pages = total_pages;
        this.total_items = total_items;
    }
}