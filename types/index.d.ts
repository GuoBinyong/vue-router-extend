import {VueConstructor} from "vue/types/vue"
import {VueRouter} from "vue-router/types/router";

import "./router"
import "./vue"




declare const RouterExtand:{
    install:(Vue:VueConstructor, params:{VueRouter:typeof VueRouter})=>void
}

export default  RouterExtand
