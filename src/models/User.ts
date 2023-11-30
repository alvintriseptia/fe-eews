import { IUser } from "@/entities/_index";

export default class User implements IUser{
    username: string;
    password: string;

    login(username: string, password: string){}

    async logout(){
        
        try {
            // return auth.signOut();
    } catch (error) {
            console.error("Error signing out with Google", error);
    }
    }
}