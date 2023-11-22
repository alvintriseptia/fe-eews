import { IUser } from "@/entities/_index";

export default class User implements IUser{
    username: string;
    password: string;

    login(username: string, password: string){}

    logout(){}
}