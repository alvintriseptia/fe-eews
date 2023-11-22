import { User } from "@/models/_index";
import { AnnotationsMap, action, makeObservable, observable } from "mobx";

export default class UserController {
    private user = new User();

    constructor() {
        makeObservable(this, {
            user: observable,
            login: action,
            logout: action,
            displayError: action,
        } as AnnotationsMap<this, any>);
    }

    /**
     * Logs in the user with the provided username and password.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     */
    login(username: string, password: string) {}

    /**
     * Logs out the user.
     */
    logout() {}

    /**
     * Displays an error message.
     */
    displayError() {}
}
