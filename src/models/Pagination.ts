export default class Pagination {
    public page: number;
    public perPage: number;
    public total_pages: number;
    public total_items: number;

    constructor(page = 1, perPage = 10, total_pages = 1, total_items = 0) {
        this.page = page;
        this.perPage = perPage;
        this.total_pages = total_pages;
        this.total_items = total_items;
    }
}