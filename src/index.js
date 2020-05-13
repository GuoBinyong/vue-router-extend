import "es-expand"
import "bom-expand"
import {includeAllWihtArray_MergeStrategy} from "vue-tls"

/**
 * 路由数据所处的阶段的标识符常量
 */
const routeDataPhaseId = {
  send: "send",      // 发送阶段；表示当前路由正在 from 的位置，还未发生跳转；
  receive: "receive",    // 接收阶段；表示当前路由已经跳转到 to 的位置；
  end: "end"     // 结束阶段；表示路由数据的传递已经结束；
};


/**
 * 路由行为的标识符常量
 */
const routeActionId = {
  leave: "leave",    // 离开； 表示路由将要离开当前组件
  enter: "enter"   // 进入； 表示路由将要进入组件
};



/**
 * 导航类型标识符常量
 */
const navTypeMap = {
  back: "back",    // 后退
  forward: "forward",   // 前进
  push: "push",    // 推入
  replace: "replace",   // 替换
  load: "load"  //加载
};


export default {
  install: function (Vue, {VueRouter}) {




    /**
     * 给 VueRouter 实例 添加计算属性
     */
    Object.defineProperties(VueRouter.prototype, {
      /*
      * routeDataMapKey ，用于存取访问所有路由数据的key ，当访问 routeDataMapKey 时，如果 routeDataMapKey 不存在，则会取创建
      * */
      routeDataMapKey: {
        get: function () {
          if (!this._routeDataMapKey) {
            this._routeDataMapKey = "routeDataMap";
          }
          return this._routeDataMapKey;
        },
        set: function (newValue) {
          this._routeDataMapKey = newValue;
        }
      },

      /*
      * lastDataKeyKey ，用于存取访问lastDataKey的key ，当访问 lastDataKeyKey 时，如果 lastDataKeyKey 不存在，则会取创建
      * */
      lastDataKeyKey: {
        get: function () {
          if (!this._lastDataKeyKey) {
            this._lastDataKeyKey = "routeLastDataKey";
          }
          return this._lastDataKeyKey;
        },
        set: function (newValue) {
          this._lastDataKeyKey = newValue;
        }
      },


      /*
    * lastDataKey ，用于存取最后一次的 routeDataKey
    * */
      lastDataKey: {
        get: function () {
          let lastDataKey = localStorage.getItem(this.lastDataKeyKey);
          return lastDataKey;
        },
        set: function (newValue) {
          localStorage.setItem(this.lastDataKeyKey, newValue);
        }
      },


      /*
      * defaultToKey ，用于存取默认的 toKey
      * */
      defaultToKey: {
        get: function () {
          if (!this._defaultToKey) {
            this._defaultToKey = "any";
          }
          return this._defaultToKey;
        },
        set: function (newValue) {
          this._defaultToKey = newValue;
        }
      },

      /*
      * defaultFromKey ，用于存取默认的 fromKey
      * */
      defaultFromKey: {
        get: function () {
          if (!this._defaultFromKey) {
            this._defaultFromKey = "any";
          }
          return this._defaultFromKey;
        },
        set: function (newValue) {
          this._defaultFromKey = newValue;
        }
      },


      /**
       * 标识路由数据所处的阶段；目前主要用于在 无法向 to 传递 dataKey 的时候，防止获取旧的路由数据；
       */
      routeDataPhase: {
        get: function () {
          if (!this._routeDataPhase) {
            this._routeDataPhase = routeDataPhaseId.end;
          }
          return this._routeDataPhase;
        },
        set: function (newValue) {
          this._routeDataPhase = newValue;
        }
      },


      /**
       * 设置或者检查所有路由位置对象的属性名数组；只能接收数组类型 或者 假值(如：null、undefined 等等)
       */
      locatPropsOfRouteData: {
        get: function () {
          if (!this._locatPropsOfRouteData) {
            this._locatPropsOfRouteData = [];
          }
          return this._locatPropsOfRouteData;
        },
        set: function (newValue) {

          if (!newValue || Array.isArray(newValue)) {
            this._locatPropsOfRouteData = newValue;
          } else {
            throw "locatPropsOfRouteData 只能接收数组类型 或者 假值(如：null、undefined 等等)";
          }
        }
      },





      //导航信息：开始

      /**
       * 获取导航信息
       * navInfo.type : string   描述本次导航的类型， 该属性可能的值由 navTypeMap 常量定义
       * navInfo.arguments : Arguments || Array   描述本次导航的参数
       */

      navInfo:{
        get: function () {
          if (!this._navInfo) {
            this._navInfo = {
              type : navTypeMap.load
            } ;
          }
          return this._navInfo;
        }

      },



      //导航信息：结束




      //路由位置判断：开始


      /**
       * 表示当前位置是否在指定的特殊位置处（通过 this.specialLocats）
       *
       * 注意：需要设置 this.specialLocats
       * this.specialLocats : Location | Array<Location>  表示特殊位置的 Location  或 Location 数组
       */
      isOnSpecialLocats:{
        get: function () {

          let specialLocats = this.specialLocats ;

          if (Array.isArray(specialLocats)) {
            return this.isOnSomeOfLocats(specialLocats) ;
          }else {
            return this.isOnLocat(specialLocats) ;
          }

        }
      },



      /**
       * 表示当前位置是否在指定的特殊位置处（通过 this.specialLocats）
       *
       * 注意：需要设置 this.specialLocats
       * this.specialLocats : Location | Array<Location>  表示特殊位置的 Location  或 Location 数组
       */
      specialLocatsIsInMatched:{
        get: function () {

          let specialLocats = this.specialLocats ;

          if (Array.isArray(specialLocats)) {
            return this.someOfLocatsIsInMatched(specialLocats) ;
          }else {
            return this.locatIsInMatched(specialLocats) ;
          }

        }
      },

      //路由位置判断：结束




    });



    //导航信息：开始

    /**
     * 设置导航信息
     * @param navType : string | number    导航的类型，当导航类型为非字符串时，会自动处理为要应的字符串
     * @param argList :  Arguments | Array  导航的参数
     *
     */
    VueRouter.prototype.setNavInfo = function (navType,argList) {

      let argArr = argList ? [...argList] : [] ;

      let _navInfo = {
        type:navType,
        arguments:argArr
      };


      let navTypeType = typeof navType ;


      if (!navType){
        _navInfo.type = navTypeMap.load ;
      }else if (navTypeType == "number") {

        if (navType < 0) {
          _navInfo.type = navTypeMap.back ;
        }else if (navType > 0) {
          _navInfo.type = navTypeMap.forward ;
        }

        _navInfo.arguments = [navType] ;
      }

      this._navInfo = _navInfo ;
    }




    let {go:oriGo,push:oriPush,replace:oriReplace} = VueRouter.prototype ;

    VueRouter.prototype.go = function(stepNum) {

      this.setNavInfo(stepNum)

      oriGo.apply(this,arguments);
    }


    VueRouter.prototype.push = function () {

      this.setNavInfo(navTypeMap.push,arguments);

      oriPush.apply(this,arguments);
    }



    VueRouter.prototype.replace = function () {

      this.setNavInfo(navTypeMap.replace,arguments);

      oriReplace.apply(this,arguments);
    }



    //导航信息：结束



    //路由位置判断：开始

    /**
     * 测试指定的路由位置是否是在当前的路由位置
     * @param locat : Loaction    被测试的位置
     * @return boolean    指定的路由位置是否是在当前的路由位置
     */
    VueRouter.prototype.isOnLocat = function(locat){

      if  (!locat) {
        return false ;
      }

      let targetRoute = this.match(locat);
      let currentRoute = this.currentRoute ;

      return targetRoute.path == currentRoute.path || targetRoute.name == currentRoute.name ;
    }


    /**
     * 测试指定的路由位置数组中是否有在当前的路由位置的元素
     * @param locatList : Array<Loaction>   被测试的所有位置的数组
     * @return boolean
     */
    VueRouter.prototype.isOnSomeOfLocats = function(locatList){

      return locatList.some((locat)=>{
        return this.isOnLocat(locat) ;
      });

    }






    /**
     * 测试指定的位置是否在 当前路由 的 matched 中；
     * @param locat : Loaction    被测试的位置
     * @return boolean    表示指定的位置是否在 当前路由 的 matched 中；
     */
    VueRouter.prototype.locatIsInMatched = function(locat){

      if  (!locat) {
        return false ;
      }

      let targetRoute = this.match(locat);
      let matcheds = this.currentRoute.matched ;

      return matcheds.some(function (matchedRoute) {
        return matchedRoute.path == targetRoute.path
      });

    }


    /**
     * 测试指定的位置是否在 当前路由 的 matched 中；
     * @param locatList : Array<Loaction>   被测试的所有位置的数组
     * @return boolean    表示指定的位置是否在 当前路由 的 matched 中；
     */
    VueRouter.prototype.someOfLocatsIsInMatched = function(locatList){

      return locatList.some((locat)=>{
        return this.locatIsInMatched(locat) ;
      });

    }

    //路由位置判断：结束







    /**
     * 把JSON字符串化的路由位置信息转换成路由位置对象，用于解析通过路由参数传过来的路由信息
     * 说明：
     * 因为路由参数对象只能有一层属性，即属性值只能是普通对象，当属性值是对象类型时，在返回时会有问题；所以，如果属性值需要是对象类型，则可以先把对象类型转为JSON字符串；当解析该JSON字符串，可用该方法解析
     *
     * @param locatStr
     * @returns {*}
     */
    VueRouter.prototype.locatStringToObject = function (locatStr) {
      return JSON.isJSONString(locatStr) ? JSON.parse(locatStr) : {path: locatStr};;
    }


    /**
     * 把路由位置对象转换成完整的URL字符串
     * @param loca : string | Location对象    路由位置
     * @returns string    : 完成的URL字符串
     */
    VueRouter.prototype.locationToURLStr = function (loca) {

      if (!loca || loca.isURL){
        return loca;
      }

      let locatRes = this.resolve(loca);
      let locatStr = locatRes.href;

      let urlPrefix = null


      switch (this.mode) {
        case "hash" :{
          urlPrefix = window.location.href;
          let hashNum = urlPrefix.indexOf("#");
          urlPrefix = urlPrefix.substring(0, hashNum);

          break;
        }


        case "history" :{
          urlPrefix = window.location.origin;
          break;
        }
      }


      let urlStr = urlPrefix + locatStr;

      return urlStr;
    }


    /**
     * 解析路由参数中与路由相关的参数值（如：to、from、back）
     * @param routeParamValue : 非对象类型  路由参数中与路由相关的参数值
     * @returns {*}
     */
    VueRouter.prototype.parseRouteParamValueOfRoute = function (routeParamValue) {
      let parseResult = routeParamValue;

      if (typeof routeParamValue == "object" || typeof routeParamValue == "function") {
        throw "路由中不能传递对象类型的参数，如果你需要传，可以用 JSON.stringify 将对象转换成字符串！"
      } else {
        parseResult = this.locatStringToObject(routeParamValue);
      }

      return parseResult;
    }


    /**
     * 解析路由参数中值为JSON字符串的参数值
     * @param routeParamValue : 非对象类型  路由参数中值为JSON字符串的参数值
     * @returns any
     */
    VueRouter.prototype.parseObjectParamValueOfRoute = function (ObjectParamValue) {
      let parseResult = ObjectParamValue;

      if (typeof ObjectParamValue == "object" || typeof ObjectParamValue == "function") {
        throw "路由中不能传递对象类型的参数，如果你需要传，可以用 JSON.stringify 将对象转换成字符串！"
      } else {
        parseResult = JSON.correctParse(ObjectParamValue);
      }

      return parseResult;
    }




    /**
     * 通过路由的行为 配置 routeDataPhase
     * @param action
     */
    VueRouter.prototype.routeAction = function (action) {

      switch (action) {
        case routeActionId.leave : {
          if (this.routeDataPhase == routeDataPhaseId.receive) {
            this.routeDataPhase = routeDataPhaseId.end;
          }

          break;
        }

        case routeActionId.enter : {
          if (this.routeDataPhase == routeDataPhaseId.send) {
            this.routeDataPhase = routeDataPhaseId.receive;
          }
          break;
        }

      }

    };


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
    VueRouter.prototype.setRouteData = function (key, routeData) {
      let appStore = this.app && this.app.$store;

      if (appStore && this.setRouteDataMutation) {
        let payload = {key: key, data: routeData};
        appStore.commit(this.setRouteDataMutation, payload);

      } else {

        let routeDataMap = localStorage.getParsedItem(this.routeDataMapKey) || {};
        routeDataMap[key] = routeData;
        localStorage.setAnyItem(this.routeDataMapKey, routeDataMap);
      }

      this.lastDataKey = key;

      //配置路由阶段：发送阶段
      this.routeDataPhase = routeDataPhaseId.send;
    }


    /**
     * 获取路由数据
     * @param dataKey  路由数据的key
     * @returns any
     *
     * 注意：
     * 如果需要通过 Vuex 来存获取路由数据，则需要设置 getRouteDataFromStore ；
     * this.getRouteDataFromStore : (store,dataKey)=>RouteData   用于从Vuex的 store 中获取 相应 routeDataKey 的 routeData ;
     */
    VueRouter.prototype.getRouteData = function (dataKey) {

      let routeDataKey = null;
      let lastDataKey = this.routeDataPhase != routeDataPhaseId.end && this.lastDataKey ;

      let navType = this.navInfo.type ;
      if (navType == navTypeMap.back  || navType == navTypeMap.forward) {
        routeDataKey = lastDataKey || dataKey;
      }else {
        routeDataKey = dataKey || lastDataKey;
      }


      if (!routeDataKey) {
        return null;
      }

      let appStore = this.app && this.app.$store;
      let routeData = null;

      if (appStore && this.getRouteDataFromStore) {
        routeData = this.getRouteDataFromStore(appStore, routeDataKey);
      } else {

        let routeDataMap = localStorage.getParsedItem(this.routeDataMapKey) || {};
        routeData = routeDataMap[routeDataKey];
      }

      return routeData;
    }


    /**
     * 根据 fromKey 和 toKey 生成 routeDataKey ; 格式为 fromKey-toKey
     * @param fromKey : string    可选；默认为 this.defaultFromKey ；
     * @param toKey : string    可选；默认为 this.defaultToKey ；
     * @return string   routeDataKey
     */
    VueRouter.prototype.createRouteDataKey = function (fromKey, toKey) {
      let finaFromKey = fromKey || this.defaultFromKey;
      let finaToKey = toKey || this.defaultToKey;
      return finaFromKey + "-" + finaToKey;
    };


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
    VueRouter.prototype.configForRouteData = function (to, routeData, from) {


      //处理 to

      let toLocation = to;

      switch (to) {

        case "back" : {
          toLocation = -1;
          break;
        }

        case "forward" : {
          toLocation = 1;
          break;
        }

      }


      let toKey = null;
      let mergedRouteData = routeData;
      let toLocationType = typeof toLocation;


      if (toLocationType == "object") { // 其它情况，toKey 是 解析后的路径
        let {routeData:toRouteData,...toWithoutRouteData} = toLocation;

        if (toRouteData) {
          mergedRouteData = {...toRouteData,...routeData};
        }

        let routeRes = this.resolve(toWithoutRouteData);
        toLocation = routeRes.location;
        toKey = routeRes.route.path;
      }










      let routeDataKey = toLocation && toLocation.query && toLocation.query.dataKey ;

      //优先使用 to 中带有 dataKey ，如果 to 中没有 dataKey ，则需要手动拼接
      if  (!routeDataKey){


        // 处理 from
        let fromRoute = from || this.currentRoute;   // fromRoute 的默认值是 this.currentRoute
        let fromKey = null;


        let fromRouteType = typeof fromRoute;
        let fromIsObj = fromRouteType === "object";
        let fromIsStr = fromRouteType === "string";

        let fromIsPath = false;
        let fromIsKey = false;

        if (fromIsStr) {
          if (fromRoute.indexOf("/") == -1) {
            fromIsKey = true;
          } else {
            fromIsPath = true;
          }
        }


        if (fromIsObj) {
          fromRoute = {...fromRoute};
        }


        if (fromIsObj || fromIsPath) {    // 当 fromRoute 是 对象或者 路径时，fromKey 是解析后的路径
          let fromRes = this.resolve(fromRoute);
          fromKey = fromRes.route.path;
        } else if (fromIsKey) {   // 当 fromRoute 是 非路径字符串时，fromKey 就是 fromRoute
          fromKey = fromRoute;
        }  // 其它情况，fromKey 是 由 this.createRouteDataKey 方法的默认值决定，在 createRouteDataKey 方法中 fromKey 的默认值就是 this.defaultFromKey;




        //配置  routeDataKey
        routeDataKey = this.createRouteDataKey(fromKey, toKey);


        if (toLocationType == "object") {
          let  query = toLocation.query || {} ;
          query.dataKey = routeDataKey;
          toLocation.query = query ;
        }


      }


      //设置 routeData
      if (mergedRouteData !== undefined) {
        this.setRouteData(routeDataKey, mergedRouteData);
      }




      return toLocation;
    }


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
    VueRouter.prototype.pushWithData = function (to, routeData, from, onComplete, onAbort) {

      let toLocation = this.configForRouteData(to, routeData, from);
      let toLocationType = typeof toLocation;

      if (toLocationType == "number") {
        this.go(toLocation);
      } else {
        this.push(toLocation, onComplete, onAbort);
      }

    }


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
    VueRouter.prototype.replaceWithData = function (to, routeData, from, onComplete, onAbort) {


      let toLocation = this.configForRouteData(to, routeData, from);
      let toLocationType = typeof toLocation;

      if (toLocationType == "number") {
        this.go(toLocation);
      } else {
        this.replace(toLocation, onComplete, onAbort);
      }

    }


    VueRouter.prototype.goWithData = function (n, routeData, from) {
      let toLocation = this.configForRouteData(n, routeData, from);
      this.go(toLocation);
    }


    VueRouter.prototype.backWithData = function (routeData, from) {
      let toLocation = this.configForRouteData(-1, routeData, from);
      this.go(toLocation);
    }


    VueRouter.prototype.forwardWithData = function (routeData, from) {
      let toLocation = this.configForRouteData(1, routeData, from);
      this.go(toLocation);
    }


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
    VueRouter.prototype.parseLocationForUseRouteData = function (locat, from, locationProps = this.locatPropsOfRouteData) {
      if (typeof locat != "object") {
        return locat;
      }

      let query = locat.query;

      if (typeof query != "object") {
        return locat;
      }


      if (query.isFlat) {
        return locat;
      }


      let {dataKey, ...routeData} = query;

      if (locationProps.length > 0) {

        Object.keys(routeData).forEach((prop) => {

          if (locationProps.includes(prop)) {
            let nextLocation = routeData[prop];
            let parsedLocation = this.parseLocationForUseRouteData(nextLocation, locat, locationProps);
            routeData[prop] = parsedLocation;
          }

        });

      }


      locat.query = {};
      let parsedLocat = null;

      if (dataKey) {
        this.setRouteData(dataKey, routeData);
        locat.query.dataKey = dataKey;
        parsedLocat = locat;
      } else {
        parsedLocat = this.configForRouteData(locat, routeData, from);
      }

      return parsedLocat;
    }


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
    VueRouter.prototype.parseLocatFlowsUseRouteData = function (locatFlows, locatProps = this.locatPropsOfRouteData) {

      if (locatProps.length > 0) {

        Object.keys(locatFlows).forEach(function (flowKey) {
          let flow = locatFlows[flowKey];

          locatProps.forEach(function (locatProp) {
            let locat = flow && flow[locatProp];
            if (locat) {
              locat = this.parseLocationForUseRouteData(locat, flowKey, locatProps);
              flow[locatProp] = locat;
            }
          })


        });


      }

      return locatFlows;
    }


    // 路由位置流转换：结束





    // Vux配置：开始




    //配置合并策略：开始
    Object.assign(Vue.config.optionMergeStrategies,{
      beforeRouteEnter:includeAllWihtArray_MergeStrategy,
      beforeRouteUpdate:includeAllWihtArray_MergeStrategy,
      beforeRouteLeave:includeAllWihtArray_MergeStrategy
    });
    //配置合并策略：结束






    let routeMixin = {
      beforeRouteEnter: function (to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建

        next(function (vm) {
          vm.$router.routeAction(routeActionId.enter);
        });
      },

      beforeRouteUpdate: function (to, from, next) {
        // 在当前路由改变，但是该组件被复用时调用
        // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
        // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
        // 可以访问组件实例 `this`

        this.$router.routeAction(routeActionId.enter);
        next();
      },

      beforeRouteLeave: function (to, from, next) {
        // 导航离开该组件的对应路由时调用
        // 可以访问组件实例 `this`
        this.$router.routeAction(routeActionId.leave);
        next();
      },

      computed: {
        /**
         * 提供路由的参数，包含 params 和 query ，并针对在 router.locatPropsOfRouteData 中定义的路由位置参数 进行处理；
         */
        $routeData: function () {
          let routeData = {};
          let route = this.$route;
          let router = this.$router;

          if (route) {

            routeData = {...route.params, ...route.query};


            let locatPropsOfRouteData = router.locatPropsOfRouteData;
            if (locatPropsOfRouteData.length > 0) {

              locatPropsOfRouteData.forEach(function (locatProp) {

                let locatVal = routeData[locatProp];
                if (locatVal) {
                  routeData[locatProp] = router.parseRouteParamValueOfRoute(locatVal);
                }

              }, this)
            }


            let dataKey = routeData.dataKey;

            let storeRouteData = router.getRouteData(dataKey);
            routeData = {...storeRouteData, ...routeData};

          }

          return routeData;
        }

      }


    };


    Vue.mixin(routeMixin);

    // Vux配置：结束


  }
}












