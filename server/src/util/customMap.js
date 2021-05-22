export default class CustomMap extends Map {
    #observer;
    #customMapper;
    constructor({ observer, customMapper }) {
        super();

        this.#customMapper = customMapper;
        this.#observer = observer;
    }

    * values() {
        for(const value of super.values()) {
            yield this.#customMapper(value);
        }
    }

    set(...args) {
        const result = super.set(...args);
        this.#observer.notify(this);

        return result;
    }

    delete(...args) {
        const result = super.delete(...args);
        this.#observer.notify(this);

        return result;
    }
}