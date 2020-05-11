
import VueRouter,{RawLocation,Location,Route} from "vue-router"


/**
 * 路由数据所处的阶段的标识符常量
 *
 "send"     发送阶段；表示当前路由正在 from 的位置，还未发生跳转；
 "receive"  接收阶段；表示当前路由已经跳转到 to 的位置；
 "end"      结束阶段；表示路由数据的传递已经结束；
 */
type RouteDataPhase = "send" | "receive" | "end"




/**
 * 路由行为的标识符常量
 *
 "leave"    离开； 表示路由将要离开当前组件
 "enter"    进入； 表示路由将要进入组件
 */
type RouteAction = "leave" | "enter"






/**
 * 导航类型标识符常量
 *
 "back" 后退
 "forward"  前进
 "push"     推入
 "replace"  替换
 "load"     加载
 */
type NavType = "back" | "forward" | "push" | "replace" | "load"


interface NavInfo {
    type : NavType;   //描述本次导航的类型
    arguments ?: Array<any>;   //描述本次导航的参数
}




declare module "vue-router/types/router" {

    interface Location {
        routeData:any;
    }


    interface VueRouter {
        /*
     * routeDataMapKey ，用于存取访问所有路由数据的key ，当访问 routeDataMapKey 时，如果 routeDataMapKey 不存在，则会取创建
     * */
        routeDataMapKey:string;


        /*
        * lastDataKeyKey ，用于存取访问lastDataKey的key ，当访问 lastDataKeyKey 时，如果 lastDataKeyKey 不存在，则会取创建
        * */
        lastDataKeyKey:string;





        /*
      * lastDataKey ，用于存取最后一次的 routeDataKey
      * */
        lastDataKey:string;




        /*
        * defaultToKey ，用于存取默认的 toKey
        * */
        defaultToKey:string;





        /**
         * 标识路由数据所处的阶段；目前主要用于在 无法向 to 传递 dataKey 的时候，防止获取旧的路由数据；
         */
        routeDataPhase:RouteDataPhase;




        /**
         * 设置或者检查所有路由位置对象的属性名数组；只能接收数组类型 或者 假值(如：null、undefined 等等)
         */
        locatPropsOfRouteData:string[]|null|undefined;








        //导航信息：开始

        /**
         * 获取导航信息
         * navInfo.type : NavType   描述本次导航的类型
         * navInfo.arguments : Arguments || Array   描述本次导航的参数
         */

        readonly navInfo:NavInfo;


        //导航信息：结束






        //路由位置判断：开始


        /**
         * 表示当前位置是否在指定的特殊位置处（通过 this.specialLocats）
         *
         * 注意：需要设置 this.specialLocats
         * this.specialLocats : Location | Array<Location>  表示特殊位置的 Location  或 Location 数组
         */
        readonly isOnSpecialLocats:boolean;




        /**
         * 表示当前位置是否在指定的特殊位置处（通过 this.specialLocats）
         *
         * 注意：需要设置 this.specialLocats
         * this.specialLocats : Location | Array<Location>  表示特殊位置的 Location  或 Location 数组
         */
        readonly specialLocatsIsInMatched:boolean;


        //路由位置判断：结束







        //导航信息：开始

        /**
         * 设置导航信息
         * @param navType : string | number    导航的类型，当导航类型为非字符串时，会自动处理为要应的字符串
         * @param argList :  Arguments | Array  导航的参数
         *
         */
        setNavInfo(navType:NavType,argList:any[]):void;


        //导航信息：结束







        //路由位置判断：开始

        /**
         * 测试指定的路由位置是否是在当前的路由位置
         * @param locat : Loaction    被测试的位置
         * @return boolean    指定的路由位置是否是在当前的路由位置
         */
        isOnLocat(locat?:RawLocation|null):boolean;




        /**
         * 测试指定的路由位置数组中是否有在当前的路由位置的元素
         * @param locatList : Array<Loaction>   被测试的所有位置的数组
         * @return boolean
         */
        isOnSomeOfLocats(locatList:RawLocation[]):boolean;








        /**
         * 测试指定的位置是否在 当前路由 的 matched 中；
         * @param locat : Loaction    被测试的位置
         * @return boolean    表示指定的位置是否在 当前路由 的 matched 中；
         */
        locatIsInMatched(locat?:RawLocation|null):boolean;




        /**
         * 测试指定的位置是否在 当前路由 的 matched 中；
         * @param locatList : Array<Loaction>   被测试的所有位置的数组
         * @return boolean    表示指定的位置是否在 当前路由 的 matched 中；
         */
        someOfLocatsIsInMatched(locatList:RawLocation[]):boolean;


        //路由位置判断：结束











        /**
         * 把JSON字符串化的路由位置信息转换成路由位置对象，用于解析通过路由参数传过来的路由信息
         * 说明：
         * 因为路由参数对象只能有一层属性，即属性值只能是普通对象，当属性值是对象类型时，在返回时会有问题；所以，如果属性值需要是对象类型，则可以先把对象类型转为JSON字符串；当解析该JSON字符串，可用该方法解析
         *
         * @param locatStr
         * @returns {*}
         */
        locatStringToObject(locatStr:string):Location;




        /**
         * 把路由位置对象转换成完整的URL字符串
         * @param loca : string | Location对象    路由位置
         * @returns string    : 完成的URL字符串
         */
        locationToURLStr(loca:RawLocation):string;



        /**
         * 解析路由参数中与路由相关的参数值（如：to、from、back）
         * @param routeParamValue : 非对象类型  路由参数中与路由相关的参数值
         * @returns {*}
         */
        parseRouteParamValueOfRoute(routeParamValue?:string):Location;






        /**
         * 解析路由参数中值为JSON字符串的参数值
         * @param routeParamValue : 非对象类型  路由参数中值为JSON字符串的参数值
         * @returns any
         */
        parseObjectParamValueOfRoute(ObjectParamValue?:string|null):any;






        /**
         * 通过路由的行为 配置 routeDataPhase
         * @param action
         */
        routeAction(action:RouteAction):void;





        /**
         * 保存路由数据
         *
         * @param key : string    路由数据保存时的键名
         * @param routeData     路由数据
         *
         *
         * 注意：
         * 如果需要使用 Vuex 来存储路由数据，则需要设置 setRouteDataMutation ；
         * this.setRouteDataMutation : string   Vuex的 store 的 用于设置 routeData 的 mutation ;
         */
        setRouteData(key:string, routeData:any):void;




        /**
         * 获取路由数据
         * @param dataKey  路由数据的key
         * @returns any
         *
         * 注意：
         * 如果需要通过 Vuex 来存获取路由数据，则需要设置 getRouteDataFromStore ；
         * this.getRouteDataFromStore : (store,dataKey)=>RouteData   用于从Vuex的 store 中获取 相应 routeDataKey 的 routeData ;
         */
        getRouteData(dataKey:string):any;





        /**
         * 根据 fromKey 和 toKey 生成 routeDataKey ; 格式为 fromKey-toKey
         * @param fromKey : string    可选；默认为 this.defaultFromKey ；
         * @param toKey : string    可选；默认为 this.defaultToKey ；
         * @return string   routeDataKey
         */
        createRouteDataKey(fromKey?:string, toKey?:string):string;




        /**
         * 在导航前配置与 routeData 相关的东西
         * @param to : Location | number | "back" | "forward"   要导航的目标位置；
         * @param routeData ? : any   需要存储的路由数据
         * @param from ? : Route | string   用于生成 routeDataKey ；默认值：router.currentRoute；
         * @return Location | number  当 to 是  number | "back" | "forward" 时，返回特效的 this.go()方法的 number 类型的数字，
         *
         * 注意：
         * - 当 to 是  number | "back" | "forward" 时，返回 null，并且会自动触发导航，其它情况，会返回解析后的目标位置对象；
         *
         * - 目标路由通过 查询参数 query.dataKey 来拿到routeDataKey ; routeDataKey = fromKey-toKey
         *
         *    - 当 from 是 对象或者 路径时，fromKey 是解析后的路径
         *    - 当 from 是 非路径字符串（根据字符串中是否包含 `/` 来判断 ）时，fromKey 就是 from
         *    - 其它情况 fromKey 就是 this.defaultFromKey
         *
         *    - 当 to 是 number 类型 或者是 "back" 或 "forward" 时，toKey 是 this.defaultToKey ;
         *    - 其它情况，toKey 是 解析后的路径
         *
         */
        configForRouteData(to:RawLocation | number | "back" | "forward" , routeData?:any, from?:Route|string):RawLocation | number;





        /**
         *
         * @param to : Location | number | "back" | "forward"   要导航的目标位置；
         * @param routeData ? : any   需要存储的路由数据
         * @param from ? : Route | string   用于生成 routeDataKey ；默认值：router.currentRoute；
         * @param onComplete ? : function
         * @param onAbort ? : function
         *
         * 注意：
         * - 当 to 是  number | "back" | "forward" 时，返回 null，并且会自动触发导航，其它情况，会返回解析后的目标位置对象；
         *
         * - 目标路由通过 查询参数 query.dataKey 来拿到 routeDataKey = fromKey-toKey
         *
         *    - 当 from 是 对象或者 路径时，fromKey 是解析后的路径
         *    - 当 from 是 非路径字符串（根据字符串中是否包含 `/` 来判断 ）时，fromKey 就是 from
         *    - 其它情况 fromKey 就是 "any"
         *
         *    - 当 to 是 number 类型 或者是 "back" 或 "forward" 时，toKey 是 "any" ;
         *    - 其它情况，toKey 是 解析后的路径
         *
         */
        pushWithData(to:RawLocation | number | "back" | "forward" , routeData ?:any, from?:Route | string, onComplete?: Function, onAbort?: (err: Error) => void):void;





        /**
         *
         * @param to : Location | number | "back" | "forward"   要导航的目标位置；
         * @param routeData ? : any   需要存储的路由数据
         * @param from ? : Route | string   用于生成 routeDataKey ；默认值：router.currentRoute；
         * @param onComplete ? : function
         * @param onAbort ? : function
         *
         * 注意：
         * - 当 to 是  number | "back" | "forward" 时，返回 null，并且会自动触发导航，其它情况，会返回解析后的目标位置对象；
         *
         * - 目标路由通过 查询参数 query.dataKey 来拿到 routeDataKey = fromKey-toKey
         *
         *    - 当 from 是 对象或者 路径时，fromKey 是解析后的路径
         *    - 当 from 是 非路径字符串（根据字符串中是否包含 `/` 来判断 ）时，fromKey 就是 from
         *    - 其它情况 fromKey 就是 "any"
         *
         *    - 当 to 是 number 类型 或者是 "back" 或 "forward" 时，toKey 是 "any" ;
         *    - 其它情况，toKey 是 解析后的路径
         *
         */
        replaceWithData(to:RawLocation | number | "back" | "forward" , routeData ?:any, from?:Route | string, onComplete?: Function, onAbort?: (err: Error) => void):void;




        goWithData(n:number | "back" | "forward", routeData ?:any, from?:Route | string):void;



        backWithData(routeData ?:any, from?:Route | string):void;



        forwardWithData(routeData ?:any, from?:Route | string):void;




        // 路由位置流转换：开始


        /**
         * 把路由位置 locat 转成通过 routeData 传送数据的路由位置 locat 对象；
         * @param locat
         * @return locat
         *
         * 注意：
         * - 该方法会自动根据路由位置层级自动生成 dataKey 来存储路由位置的参数；
         * - 如果您需要自定义路由位置的 dataKey ，只需要在路由位置的查询参数 `locat.query` 中增加 dataKey 字段  `locat.query.dataKey`
         *
         */
        parseLocationForUseRouteData(locat:RawLocation, from?:Route | string, locationProps?:string[]|null):RawLocation | number;





        /**
         * 把路由位置流的配置对象 locatFlows 中的所有 路由位置 转换成通过 routeData 传送数据的路由位置 locat 对象；该方法会更改原 locatFlows 对象，并返回更改后的原 locatFlows 对象
         *
         * @param locatFlows   路由位置流的配置对象
         * @param locatProps : Array<string>  可选；默认值为 this.locatPropsOfRouteData ; 所有路由位置对象的属性名数组
         * @return locatFlows  返回更改后的原 locatFlows 对象
         *
         *
         * 注意：
         * - 该方法会自动根据路由位置层级自动生成 dataKey 来存储路由位置的参数；
         * - 如果您需要自定义路由位置的 dataKey ，只需要在路由位置的查询参数 `locat.query` 中增加 dataKey 字段  `locat.query.dataKey`
         * - 该方法会更改原 locatFlows 对象，并返回更改后的原 locatFlows 对象
         *
         *
         */
        parseLocatFlowsUseRouteData(locatFlows:Location, locatProps?:string[]|null):Location;



        // 路由位置流转换：结束

    }



}
