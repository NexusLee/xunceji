interface ToiletItem {
    name: string
    addr: string
    author: string
    date: any
    latlng: any
}

class ToiletMap{
    item: ToiletItem = <ToiletItem>{};

    constructor() {
        LocalContractStorage.defineMapProperty(this, "repo", {});
    }

    init() {
    }

    get(city) {
        city = city.trim();
        if ( city === "" ) {
            throw new Error("empty city")
        }

        return this.repo.get(city);
    }

    save(data) {
        const date = new Date();
        let from = Blockchain.transaction.from;

        if (data === undefined || data === null) {
            throw new Error("empty item");
        }

        if (data.city == "" || data.latlng == "" || data.name == "") {
            throw new Error("empty value");
        }

        this.item.name = data.name;
        if(data.addr){
            this.item.addr = data.addr;
        }
        this.item.author = from;
        this.item.date = date;
        this.item.latlng = data.latlng;

        var toiletItems = this.repo.get(data.city);

        if(toiletItems){
            toiletItems.push(this.item)
        }else{
            toiletItems = [];
            toiletItems.push(this.item)
        }

        this.repo.put(data.city, toiletItems);

    }
}

module.exports = ToiletMap;