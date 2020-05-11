import Vue from "vue"



declare module "vue/types/vue" {

    interface Vue {

        /**
         * 提供路由的参数，包含 params 和 query ，并针对在 router.locatPropsOfRouteData 中定义的路由位置参数 进行处理；
         */
        readonly $routeData:any;

    }


}
