window.cache = {
};
define(function(require,exports,module){
    var util = require('commonBusi/util');
    var dataUtils = require('./../js/dataUtils.js');
    var dateUtil = require('commonBusi/dateUtil');
    var BroadCommon = require('./../../../js/broadCommon.js');//./../../../js/broadCommon.js
    var sessionCache = window.sessionObj;
    var crumbs;//保存面包屑
    var preOrderId;
    var addressId;
    var cache = {
        isFusion: "0",  //0：裸宽  1：融合  3.续为裸宽  4.续为融合  10.全部（具体传什么菜单里面去捞）
        regionId: sessionCache.opRegionId,
        userFlag: "",
        warnText:"",
        orderInfo:{},//订单详情
        saveOrderInfo:{},//保存后的数据
        masterInfo:{},//户主信息
        haveTV:'0',//是否有宽带电视 0没有 1 有
        haveTVMsg:'',//存在宽带电视 的提示信息
        isChannel:sessionCache.isChannel,//渠道、客服 不能点击处理按钮、审核不通过按钮
        isCallCenter:sessionCache.isCallCenter,//渠道、客服 不能点击处理按钮、审核不通过按钮
        menberClick:true,//是否添加成员
        modifyStatus:'',//修改状态 false 不在修改状态中
        isBtnClick:false,//该状态如果为false 页面所有按钮不可点击
        isNewCreat:false,//进页面后判断是否是新建，如果不是新建则其他服务可以不用继续调用
        planInfo:{},//规则校验后返回的信息
        memBandList:[],//具有宽带账号的成员列表
        businessId:"500000020064",//业务编码
        deviceMessage:"",//存放设备信息，以便后面从提醒区进行替换
        qryFeeIsChange:false,//默认查询费用的逻辑保持2018-04 第四次上线前的逻辑，调用ESB_SO_PERSONAL_WB_FEEINFOQRY_001，接口不传入档次编号。
        fusionEffType:""/*包年未到期用户转融合套餐的生效类型，1：次月生效 2：包年到期后生效*/
    };
    var commObj = {
        agent : require("common/agentInfo.js"),// 工单备注
        referee : require("common/referee.js"),	// 经办人信息
        responsible : require("common/responsibleInfo.js")//推荐人
    };
    var listenUrls = [];
    module.exports = returnObject(listenUrls,util, dataUtils, BroadCommon, sessionCache, commObj, crumbs, cache, require, preOrderId,dateUtil);
});
function returnObject(listenUrls,util, dataUtils, BroadCommon, sessionCache, commObj, crumbs, cache, require, preOrderId,dateUtil) {

    var bandToFusion = {
        init : function(param){
            preOrderId = param.preOrderId || param.ele.preOrderId;
            cache.userFlag = param.userFlag;
            this.addListenForUrl(listenUrls);
            this._loadCrumb();
            this._step();
            this._load_url();
        },
        addListenForUrl: function(listenUrls){
            var self = this;
            $(document).on('ajaxSend',function(){
                //显示loading
                if(listenUrls.length <= 0){
                    util.CommModule_loading("加载中");
                }
                //添加监听url
                listenUrls.push(arguments[2].url);
            }).on('ajaxComplete',function(){
                var ajaxUrl = arguments[2].url;
                for(var i = 0; i < listenUrls.length; i++){
                    //删除已经完毕的ajax请求监听
                    if(listenUrls[i] == ajaxUrl){
                        listenUrls.splice(i,1);
                    }
                }
                //没有需要监听的ajax才关闭等待条
                if(listenUrls.length <= 0){
                    util.CommModule_unloading();
                }
            });
        },
        //面包屑
        _loadCrumb:function(){
            var opt = {
                "item" : [{
                    "text": "1.信息处理"
                }, {
                    "text": "2.业务办理"
                }, {
                    "text": "3.竣工配送"
                }],
                step:1,
                visited: false,
                afterStep: step
            };
            crumbs = $('.crumbs').AIStep(opt);
            //面包屑入参
            function step(obj){
                //得到当前流程位置
                var index = obj.getStep();
                switch (index) {
                    case 1:
                        $('#JS_STEP_1').removeClass('none');
                        $('#JS_STEP_2').addClass('none');
                        $('#JS_STEP_3').addClass('none');
                        break;
                    case 2:
                        $('#JS_STEP_1').addClass('none');
                        $('#JS_STEP_3').addClass('none');
                        $('#JS_STEP_2').removeClass('none');
                        break;
                    case 3:
                        $('#JS_STEP_1').addClass('none');
                        $('#JS_STEP_2').addClass('none');
                        $('#JS_STEP_3').removeClass('none');
                        break;
                    default:
                        break;
                }
            };
        },
        //流程事件
        _step:function(){
            this._backStep();
            this._nextStep();
            this._add_btn_event();
        },
        _backStep:function() {
            var self = this;
            //取消录入
            $('#cancel_entering').bind("click", function(){
                if($('#cancel_entering').hasClass('btn-disabled')){
                    return;
                }
                self._cancelEntering();
            });
            //受理提交页面 上一步
            $("#goto_information").bind("click", function(){
                crumbs.prevStep();
            });
        },
        _nextStep:function() {
            var self = this;
            //处理页面 下一步
            $("#handle").bind("click", function(){
                //TODO
                if($('#handle').hasClass('btn-disabled')){
                    return;
                }
                if(self.check_cont_emp()){
                    util.toastSuccess("联系人和联系电话不能为空！", 1500, 'warn');
                    return;
                }
                if (!$("#uniform_pay").hasClass("btn-disabled")) {
                    util.toastSuccess('请先操作添加统一支付！', 1500, 'warn');
                    return;
                }
                if ($.isEmptyObject(cache.orderInfo)) {
                    util.toastSuccess('初始化不成功，请重新进入页面！', 1500, 'warn');
                    return ;
                }
                self._checkJuageSpeed();
            });
            //受理提交下一步
            $("#commit_accept").bind("click", function(){
                self._band_to_fusion();
            });
        },
        //初始化请求
        _load_url:function(){
            var self = this;
            self._channelCheck();
            self._buttonStatusDis();
            var param = {};
            param = {
                "preOrderId":preOrderId
            };
            if (!param.preOrderId) {
                util.messagerAlert("预受理单号不能为空！");
                return;
            }

            BroadCommon.offersInfo.qryFeeIsChange({
                callback:function(flag){
                    cache.qryFeeIsChange = flag;
                }
            });
            dataUtils._qry_band_deal_info(param,function(json){
//				json = {"addPreference":"","addPreferenceExplain":"","address":"~~~~~~","addressExt":"","addressId":"","broadAcct":"nbzhb57494489","broadOfferId":"600000532182","broadOfferName":"~~~~~~~~","broadTVCount":"","broadTVCountExt":"0","broadTVCountIn":"","busiType":"2","busiTypeDesc":"","certCode":"3302~~~~~~467~","certType":"1","certTypeName":"身份证（含临时身份证）","checkFlag":"","completTime":"","connType":"CMCC_GPON+FTTH","connTypeCode":"","connectionName":"CMCC_GPON+FTTH","connectionType":"1","contBillId":"15257494489","contName":"余凯","cooperation":"移动","cooperationId":"1","countyId":"5748","createTime":"2018-12-04 11:27:24","dealState":"0","dealStateDesc":"新建","doneTime":"2018-12-04 11:27:24","effectiveTime":"","expireToFusionFlag":"1","extParam2":"","extParam3":"","extparam1":"","fixMod":"","fixOfferList":[],"fixPassword":"","fixedBillId":"","gridContBillId":"","gridOrgId":"","gridOrgName":"","imepContactMobile":"","intradayService":"","isDoorFee":"","isFusion":"1","isFusionDesc":"续包为融合","isNeedNnstall":"","marketId":"","marketKindId":"600000525356","marketKindName":"【融合升级融合(一年)】100M融合2条测试B套餐（测试专用），宽带成员：100M融合第1条测试成员B套餐；第2条宽带成员：100M融合第2条测试成员B套餐","marketName":"","marketOpCode":"","marketOpName":"","masterInfo":{"custAddress":"","masterBillId":"150~~~~377","masterName":"余~"},"membersList":[],"menuType":"","needPayFee":"已收费","needPayFeeDesc":"已收费","offerList":[{"offerId":"","offerName":"H5宽带融合续费","offerType":""}],"oldOfferInfo":{"oldAddress":"","oldBroadOfferName":"","oldContBill":"","oldContName":""},"opId":"10196174","opName":"李张伟","orgId":"10000534","orgName":"宁波宁海梅林营业厅","orgTypeName":"1","orgTypeNameDesc":"社会渠道","partner":"","payAmount":"","payWayState":"0","payWayStateDesc":"现金缴款","picFileId":"","preDate":"","preFixBillId":"","prepayBillId":"","prepayBillIdNew":"","proInvoiceState":"0","proInvoiceStateDesc":"不提供","prolongType":"1020","prolongTypeDesc":"群组组网","regionId":"574","regionName":"宁波","relatBillId":"","remarks":"户主入网时间：2017-11-22 09:23:38.0","retCode":"200","retMessage":"","stateOpId":"10196174","stateOpName":"李张伟","stateOrgId":"10000534","stateOrgName":"","timeArea":"","tvBoxMonth":"","tvBoxYear":"","verifyOpinion":"","wifiAttrDesc":"","recommendPersonId":"","recommendPersonName":""};
                cache.orderInfo = json;
                self.marketKindId = json.marketKindId;  //zhangmeng
                self.marketKindName = json.marketKindName;  //zhangmeng
                //检测该页面是否能够继续处理
                self._check_dealState(json);
                //给成员添加宽带账号成员
                self._add_broadband_bill();
                //宽带电视校验
                //宽带电视校验
                var tvParam = {
                    "billId":cache.orderInfo.contBillId,
                    "kindId":cache.orderInfo.marketKindId
                };
                self._check_tv(tvParam,function(json){
                    //加载提醒区
                    self._load_broad_warn_info_module(json);
                });
                var masterInfo = json.masterInfo;
                //展示策划信息
                if(json.broadAcct){
                    param = {
                        "billId":json.broadAcct// "jhwch24491913"
                    };
                    self._loadOfferInfo(param);
                }
                $('#region').val(json.regionName);
                $('#ext').val(json.broadAcct);
                $('#master_name').val(masterInfo.masterName);
                $('#master_bill_id').val(masterInfo.masterBillId)
                $('#cust_cert_type_type').val(json.certTypeName);
                $('#cust_cert_code').val(json.certCode);
                $('#continue_Type').val(json.isFusionDesc);
                //zhangmeng
                //$('#offer_plan_broadband_name').html(json.broadOfferName);
                $('#done_date').val(json.createTime);
                $('#is_need_fee').val(json.needPayFeeDesc);
                //zhangmeng改动根据是否收费展示档次是否可以改动
                self.load_broadband_kind_info(json);
                //TODO
                if (!cache.isNewCreat || cache.userFlag == "4" ) {
                    //加载tpl
                    $('#member_info').hide();
                    $('#member_list').removeClass('none');
                    $('.ConsumeInfo').hide();
                    self._load_menber();
                    self._loadView();
                    return;
                }
                //户主校验
                self._masterInfoCheck();
                //校验用户账户客户名称是否一致
                self._checkMasterNameSameByUserId();
                // 校验户主是否实名，是否统一支付户主，成员能否加入统一支付
                self._is_real_name_and_acct();

                //统一支付事件绑定
                self._unifyPay();
                //加载tpl
                self._loadView();
                //加载户主保底和近三月消费信息
                self._getMasterLeastCostInfo(json);
            });
        },


        //加载客户策划信息 接入方式
        _loadOfferInfo:function(param){
            var self = this;
            Rose.ajax.postJson(srvMap.get('qryacctofferinfo'),param,function(json,status){
                if(status){
                    var monthInfo = json.offerTypeMonthName;
                    addressId = json.addressId;
                    if(json.offerTypeYearName){
                        var yearInfo = json.offerTypeYearName+"; "+ monthInfo;
                        $('#offer_info_month').attr("title",yearInfo).val(yearInfo);
                    }else{
                        $('#offer_info_month').attr("title", monthInfo).val(monthInfo);
                    }
                    $('#conn_type').val(json.serviceName);
                }else{
                    util.messagerAlert(json.retMessage ||"客户宽带信息和接入方式查询失败");
                }
            });
        },
        //获取设备类型，判断是否需要换设备
        _get_device_type: function(){
            var self = this;
            srvMap.add('getDeviceInfo', 'rboss/broadbandpre/toFusion/getDeviceInfo.json','QRY_DEVICE_INFO_PC');
            var param = {
                "regionId": cache.orderInfo.regionId,
                "billId": cache.orderInfo.broadAcct,
                //查询设备类型增加入参操作方式1新装2变更3移机
                "operType":"2"
            }
            //若档次下拉框渲染完成则从档次下拉框中获取档次的ID 否则从预受理信息中获取档次ID
            if($('#offer_plan_broadband_name').hasClass("combobox-f")){
                param.marketKindId = $('#offer_plan_broadband_name').combobox('getValue');
            }else{
                param.marketKindId = cache.orderInfo.marketKindId;
            }
            Rose.ajax.postJson(srvMap.get('getDeviceInfo'), param, function(json, status) {
                if (status) {
                    var flag = json.flag;
                    var message = json.message;
                    if(flag == "0"){
                        if (cache.warnText == "" || cache.warnText == undefined) {
                            cache.warnText = message;
                        } else {
                            if(cache.deviceMessage != ""){
                                if(cache.warnText.indexOf(cache.deviceMessage) != "-1"){
                                    var reg = new RegExp(cache.deviceMessage,"g");
                                    cache.warnText = cache.warnText.replace(reg,message);
                                }else{
                                    cache.warnText += "； " + message;
                                }
                            }else{
                                cache.warnText += "； " + message;
                            }
                        }
                        cache.deviceMessage = message;
                        $('#warn_info_warn').val(cache.warnText);
                    }
                    if(flag=="1"){
                        $(".euip").removeClass("none");
                        $("#euipType").text(json.deviceType);

                        if (cache.warnText == "" || cache.warnText == undefined) {
                            cache.warnText = message;
                        } else {
                            if(cache.deviceMessage != ""){
                                if(cache.warnText.indexOf(cache.deviceMessage) != "-1"){
                                    var reg = new RegExp(cache.deviceMessage,"g");
                                    cache.warnText = cache.warnText.replace(reg,message);
                                }else{
                                    cache.warnText += "； " + message;
                                }
                            }else{
                                cache.warnText += "； " + message;
                            }
                        }
                        cache.deviceMessage = message;
                        $('#warn_info_warn').val(cache.warnText);


                    }
                } else {
                    util.messagerAlert(json.retMessage || "查询套餐配置的设备出错，联系维护人员");
                }
            });
        },
        //根据是否收费是否可以改动，展示档次列表
        load_broadband_kind_info: function(json){
            var self=this;
            var marketKindId=json.marketKindId;
            var marketKindName=json.marketKindName;
            var param = {
                "isFusion": "4", //0：裸宽  1：融合  3.续为裸宽  4.续为融合  10.全部
                "regionId": json.regionId //地市编号
            };
            dataUtils._post_data(srvMap.get('queryKindList'), param, function(json) {
                if(json&&json.preKindList) {
                    $('#offer_plan_broadband_name').combobox({
                        'width':400,
                        'valueField': 'kindId',
                        'textField': 'kindName',
                        'data': json.preKindList,
                        'value': marketKindId,
                        'editable': true,
                        'disabled': true,
                        onSelect: function(record){
                            self.check_select_true(record.kindId,record.kindName);
                        }
                    });
                    $('#offer_plan_broadband_name').next().find("input").attr('readonly', 'readonly').removeAttr("disabled").addClass("readonly-disabled-bgcolor");
                    self.load_kind_tips();
                }
            });
        },

        //加载档次后面的气泡
        load_kind_tips: function(){
            $(".details-tip").removeClass('none');
            $(".details-tip").off('mouseenter').on('mouseenter', function() {
                var $ele = $(this);
                var message = "请注意修改前后的档次费用应该保持一致！";
                $ele.tooltip({
                    position: 'bottom',
                    content: message,
                    onShow: function() {
                    }
                });
            });
        },
        //选择新的档次后
        check_select_true: function(KindId,KindName){
            var self = this;
            var obj = {
                marketKindId: KindId,
                callback: function(json, status){
                    if(status){
                        if(Number(json.billMaxNum)<Number($("#member_now_number").text())){
                            $('#offer_plan_broadband_name').combobox("setValue", self.marketKindId);
                            util.toastSuccess('您当前的成员超过新档次最大（'+json.billMaxNum+'）人限制，请删除成员后再选取该档次！', 3000, 'warn');
                            return;
                        }
                        $('#member_min_number').text(json.billMinNum);
                        $('#member_max_number').text(json.billMaxNum);
                        var object = {
                            marketKindId: self.marketKindId,//原来的档次
                            callback: function(jsonValue,jsonStatus){
                                var notes = $('#remark_info_remark').val().trim();
                                if(jsonValue.broadMsg){
                                    notes = notes.replace(jsonValue.broadMsg,json.broadMsg);//新的费用信息覆盖老的费用信息
                                    $('#remark_info_remark').val(notes);
                                }

                            }
                        };
                        $('#save').removeClass('btn-disabled');
                        self.query_Kind_Detail_Info(object);
                        self._get_device_type();
                    }else{
                        $('#save').addClass('btn-disabled');
                        util.messagerAlert(json.retMessage || "查询出错，联系维护人员");
                    }
                }
            }
            self.query_Kind_Detail_Info(obj);
        },
        //得到档次的offerId 后再执行
        afterGetOfferIdFusion: function(){
            var self = this;
            //校验该成员最大添加数量
            self._qry_menber_number({"kindId": cache.orderInfo.marketKindId});
        },
        //查询档次详情
        query_Kind_Detail_Info: function(obj){
            var self = this;
            var param={
                'billId': cache.orderInfo.broadAcct,
                'isFusion': "4",
                conType:cache.orderInfo.connectionType,
                'kindId': obj.marketKindId,
                'payWayState': cache.orderInfo.payWayState,
                //'conType': cache.orderInfo.connType,
                //'extParam': cache.orderInfo.cooperationId,
                'addressId': (cache.orderInfo.addressId == "" || cache.orderInfo.addressId == "0")?addressId:cache.orderInfo.addressId,
                'prePayBillId': cache.orderInfo.prepayBillId

            };
            Rose.ajax.postJson(srvMap.get('queryKindDetailInfo'), param, function(json, status) {
                if (json) {
                    if(self.marketKindId != obj.marketKindId){
                        cache.offerId = json.fusionOffer;
                    }
                    self.afterGetOfferIdFusion();
                    obj.callback && obj.callback(json, status);

                }
            });
        },

        //非新建状态进入页面
        _load_menber:function(){
            var menbers = cache.orderInfo.membersList;
            if (menbers.length == 0) {
                $('#member_list').hide();
                return;
            }
            var mem = '<span class="title">成员信息</span>';
            for ( var i = 0,num = menbers.length; i < num; i++) {
                if(i >= 6){
                    break;
                }
                var item = menbers[i];
                mem += '<div class="input-group no-border">'+
                    '<label class="ui-label">成员号码:</label>'+
                    '<input class="ui-input color333" id="memBIll'+i+'" type="text"   value="'+item.memBillId+'" readonly="readonly"  />'+
                    '</div>'+
                    '<div class="input-group no-border">'+
                    '<label class="ui-label">成员姓名:</label>'+
                    '<input class="ui-input color333" id="memName'+i+'" type="text"    value="'+item.memName+'" readonly="readonly" />'+
                    '</div>';
            }
            mem += "<hr>";
            $('#member_list').html(mem);
        },
        //校验页面按钮是否能点击
        _check_dealState: function(json){
            var self = this;
            //dealState 0 新建 页面按钮可以点击 不为0 不可以点击
            if(json.dealState == "0") {
                cache.isBtnClick = true;
                cache.isNewCreat = true;
            } else {
                //dealState 不为0 所有按钮不可点击
                cache.isBtnClick = false;//false
                cache.isNewCreat = false;
                self._handleBtnIsDisabled(true);
                $("#cancel_entering,#modify,#save,#add_number_btn").addClass("btn-disabled");
                $("#add_number_btn span").addClass("icon-add-grey").removeClass("icon-add");
                self.uniform_pay_add_gray(true);
            }
        },
        //渠道、客服 不能点击处理按钮、审核不通过按钮
        //isCallCenter == 1 是客服 isChannel == 1 是渠道
        _channelCheck:function(){
            if (sessionCache.isCallCenter  == '1' || sessionCache.isChannel  == '1') {
                cache.menberClick = false;
                $("#add_number_btn").addClass("btn-disabled");
                this._handleBtnIsDisabled(true);
                this._hidden();
            }else{
                cache.menberClick = true;
            }
        },
        _buttonStatusDis:function(){
            var self = this;
            if(cache.userFlag == "4") {

                cache.menberClick = false;
                $("#add_number_btn").addClass("btn-disabled");
                self._handleBtnIsDisabled(true);
                self._hidden();
                var msg = "该宽带用户已是融合成员，不允许再次受理。";
                self._setWarnText(msg);
            }
        },
        _hidden: function(){
            $('#handle,#modify,#save').hide();
        },
        //校验是否有宽带电视
        _check_tv :function(tvParam,callback){
            var self=this;
            if (!(self.marketKindId)) {
                util.messagerAlert("档次ID不能为空！");
                return ;
            }
            dataUtils._check_has_tv(tvParam,function(json){
                callback && callback(json);
                //没有宽带电视
            },function(json){
                callback && callback(json);
            });
        },
        //户主校验
        _masterInfoCheck:function(){
            var self = this;
            var param = {};
            param.masterInfo = cache.orderInfo.masterInfo;
            param.regionId = cache.orderInfo.regionId;
            param.operType = "1";//多校验统一支付的户主规则
            param.callback = function(json){
                cache.masterIsPass = json.isPass;
                if (json.isPass == "0") {
                    self._noPassWarnText(json);
                }
            };
            param.failback = function(){
            };
            BroadCommon.masterCheck._master_check(param);
        },
        //户主校验不通过 处理方式
        _noPassWarnText:function(json){
            var self = this;
            //未通过 处理按钮不能点击
            self._handleBtnIsDisabled(true);
            self.uniform_pay_add_gray(true);
            var billId = cache.orderInfo.masterInfo.masterBillId;
            var rows = json.rows;
            var retMessage = "";
            for ( var int = 0; int < rows.length; int++) {
                var obj = rows[int];
                var tempBillId = obj.billId;
                if (billId === tempBillId) {
                    retMessage = billId + ": ";
                    var ruleInfo = obj.ruleInfo.errList;
                    for ( var int2 = 0; int2 < ruleInfo.length; int2++) {
                        var error = ruleInfo[int2];
                        retMessage += error.msg;
                    }
                    break;
                }
            }
            self._setWarnText(retMessage);
        },
        //校验用户账户客户名称是否一致
        _checkMasterNameSameByUserId:function(){
            var self = this;
            var param = {
                "billId":cache.orderInfo.masterInfo.masterBillId
            };
            param.callback = function(json){
                if (json.retCode == '-1') {
                    self._handleBtnIsDisabled(true);
                    self.uniform_pay_add_gray(true);
                    self._setWarnText(json.retMessage);
                }
            };
            param.failback = function(){
            };
            BroadCommon.masterCheck._checkMasterName(param);
        },
        // 查询档次对应最大成员最小成员数量
        _qry_menber_number:function(param){
            var self = this;
            dataUtils._post_data(srvMap.get('qryBroadBandMemberNum'), param, function(json) {
                cache.billMinNum = json.billMinNum;
                cache.billMaxNum = json.billMaxNum;
                if (parseInt(cache.billMaxNum) > 6) {
                    cache.billMaxNum = "6";
                }
                $("#member_min_number").text(cache.billMinNum);
                $("#member_max_number").text(cache.billMaxNum );
                //成员信息列表
                self._getMember(cache.orderInfo.membersList);
            });
        },


        // 校验户主是否实名，是否统一支付户主，
        _is_real_name_and_acct: function() {
            var self = this;
            var param = {
                "masterInfo": cache.orderInfo.masterInfo,
                "certCode": cache.orderInfo.certCode,
                "certType": cache.orderInfo.certType
            };
            Rose.ajax.postJson(srvMap.get('isCheckRealNameAcctRule'), param, function(json, status) {
                if (status) {
                    if (json.retMessage != "") {
                        self._setWarnText(json.retMessage);
                    }
                    if (json.isReal == "false") {

                    }
                } else {
                    util.messagerAlert(json.retMessage || "查询出错，联系维护人员");
                }
            });
        },
        //获取户主保底和近三月消费信息
        _getMasterLeastCostInfo:function(json){
            //var masterInfo = json.masterInfo;
            var param = {
                "contBillId" : json.contBillId
            }
            //获取数据
            util.CommModule_loading("加载中");
            Rose.ajax.postJson(srvMap.get('getMasterLeastCostInfo'),param,function(json,status){
                util.CommModule_unloading();
                if(status){
                    $('#master_leastCost').val(json.leastCost);
                    $('#master_leastThreaMonth').val(json.leastThreaMonth);
                } else{
                    util.messagerAlert(json.retMessage || "查询静态数据出错，联系维护人员");
                }
            });
        },
        /**
         * TODO
         * 查询宽带用户的策划信息，201807 七月二次 关于包年客户未到期预约转融合套餐开发增补的需求
         */
        _qry_band_offers:function(){
            var self = this;
            if(cache.orderInfo.expireToFusionFlag == "1"){
                //宽带包年未到期预约转融合开关打开
                cache.fusionEffType = "",cache.broadVasExpTime = "";
                var justNextMonthEff = false,beforeThreeMonthExp=false,vasOfferFlag = false,expTimeDate,threeNextMonth,oneNextMonth;
                dataUtils._post_data(srvMap.get('qrySoPerWbQry001'), {billId:cache.orderInfo.broadAcct}, function(json,status) {
                    if(status) {
                        var offers = json.offerList;
                        for(var i =0,len= offers.length;i<len;i++){
                            if("OFFER_VAS_BROADBAND" == offers[i].offerType){
                                vasOfferFlag = true;
                                cache.broadVasExpTime = offers[i].expTime;
                                expTimeDate = util.dateStrToDate(offers[i].expTime);
                                threeNextMonth = new Date();
                                threeNextMonth.setDate(1);
                                threeNextMonth.setHours('0');
                                threeNextMonth.setMinutes('0');
                                threeNextMonth.setSeconds('0');
                                oneNextMonth = new Date();
                                oneNextMonth.setDate(1);
                                oneNextMonth.setHours('0');
                                oneNextMonth.setMinutes('0');
                                oneNextMonth.setSeconds('0');
                                dateUtil.addMonths(threeNextMonth,3);
                                dateUtil.addMonths(oneNextMonth,1);
                                if(expTimeDate < threeNextMonth){
                                    beforeThreeMonthExp = true;
                                    if(expTimeDate <= oneNextMonth){
                                        /*包年宽带1个月内到期的用户默认次月组网生效,不提示*/
                                        justNextMonthEff = true;
                                    }else{
                                        /*包年宽带一个月外到期三个月内到期的用户可以选择宽带自然到期后组网生效，也可以选择次月组网生效*/
                                        justNextMonthEff = false;
                                    }
                                }else{
                                    /*包年宽带3个月外到期的用户默认次月组网生效,不提示*/
                                    beforeThreeMonthExp = false;
                                    justNextMonthEff = false;
                                }
                            }
                        }
                        if(vasOfferFlag){
                            //是包年用户
                            if(justNextMonthEff){
                                //一个月内到期的宽带，默认次月加入群组，不提示
                                self._go_to_two_step();
                            }else{
                                //非次月到期

                                if(beforeThreeMonthExp){
                                    //非次月到期且三个月内到期的
                                    /*包年宽带三个月内到期的用户可以选择宽带自然到期后组网生效，也可以选择次月组网生效*/
                                    var confimObj = {};
                                    confimObj.title = "提示";
                                    confimObj.content = "请选择加入群组的生效方式。";
                                    confimObj.confirmText = "次月生效";
                                    confimObj.confirmCallback = function(node){
                                        $("#confirm_dialog_div").next().next().remove();
                                        $(node).dialog('close');
                                        cache.fusionEffType = "1";
                                        self._go_to_two_step();
                                    };
                                    confimObj.cancelText  = "预约生效";
                                    confimObj.cancelCallback = function(node){
                                        $("#confirm_dialog_div").next().next().remove();
                                        $(node).dialog('close');
                                        cache.fusionEffType = "2";
                                        self._go_to_two_step();
                                    };
                                    util.showPanel(confimObj);
                                    $("#confirm_dialog_div").next().after('<div style="background:#fff;position:relative;top:0;margin-top: 0;padding-bottom:10px;padding-left: 5%;padding-right: 5%;font-size: 12px;color: grey;"><p style="margin-top: 0;margin-bottom: 0;">次月生效：原包年终止，次月失效；群组次月生效。</p>预约生效：群组在原包年自然到期后生效。</div>');
                                }else{
                                    //非次月到期且三个月外到期的
                                    //三个月后到期的用户
                                    var confimObj = {};
                                    confimObj.title = "提示";
                                    confimObj.content = "您变更的套餐将在下月生效，原套餐下月将直接终止，请确认。";
                                    confimObj.confirmText = "确定";
                                    confimObj.confirmCallback = function(node){
                                        $(node).dialog('close');
                                        self._go_to_two_step();
                                    };
                                    confimObj.cancelText  = "取消";
                                    confimObj.cancelCallback = function(node){
                                        $(node).dialog('close');
                                    };
                                    util.showPanel(confimObj);
                                }
                            }
                        }else{
                            self._go_to_two_step();
                        }
                    }
                });
            }else{
                self._go_to_two_step();
            }
        },
        _go_to_two_step:function(){
            var self = this;
            //渲染第二个页面
            crumbs.nextStep();
            self._applyBusi();
            //滚动到顶部
            $('html, body').animate({scrollTop:0},'fast');
        },
        // 统一支付按钮事件
        _unifyPay:function(){
            var self = this;
            $("body").off('click', "#uniform_pay").on('click', "#uniform_pay", function() {
                if ($("#uniform_pay").hasClass("btn-disabled")) {
                    return;
                }
                if(!cache.isBtnClick || cache.isChannel == "1" || cache.isCallCenter == "1") {
                    return;
                }
                if ($("#uniform_pay").attr("canClick") == "0" && cache.modifyStatus) {
                    util.toastSuccess('请先点击保存按钮', 1500, 'warn');
                    return;
                }
                if ($("#uniform_pay").attr("masterStatues") == "0") {
                    util.toastSuccess('户主校验未通过，具体原因请参考提醒区！', 1500, 'warn');
                    return;
                }
                var memList = [];
                var rows = $("#member_dg").datagrid("getData").rows;
                for ( var i = 0; i < rows.length; i++) {
                    var data = $("#member_dg").datagrid('getData').rows[i];
                    if (data.rule == '1') {
                        util.messagerAlert('存在没有通过校验的成员，不允许统一支付');
                        return ;
                    }
                    memList.push({
                        "memBillId": data.memBillId
                    });
                }
                //添加宽带成员
                memList.push(self._broadInfo());
                var param = {
                    "masterInfo" : {
                        "masterBillId" : cache.orderInfo.masterInfo.masterBillId,
                        "masterName": cache.orderInfo.masterInfo.masterName
                    },
                    "membersList" : memList
                };
//				util.CommModule_loading("加载中");
                //checkDealUnipayMessagePc 该服务在/crm-ncrm/html/pc/busi/rboss/broadbandpre/js/dataUtils.js
                Rose.ajax.postJson(srvMap.get('checkDealUnipayMessagePc'), param, function(json, status) {
//					util.CommModule_unloading();
                    if(status){
                        if (json.retErrMsg != "") {
                            util.toastSuccess(json.retErrMsg, 1500, 'warn');
                        } else {
                            if (json.retMsg != "") {
                                util.showPanel({
                                    title: "统一支付受理提示",
                                    width: 450,
                                    content: json.retMsg,
                                    confirmCallback: function() {
                                        self._broad_rule_check_result_list();
                                        $("#confirm_dialog_div").dialog('close');
                                    },
                                    cancelCallback: function() {
                                        $("#confirm_dialog_div").dialog('close');
                                    }
                                });
                            } else {
                                self._broad_rule_check_result_list();
                            }
                        }
                    } else {
                        util.messagerAlert(json.retMessage || "查询统一支付提示语失败");
                    }
                });
            });
        },
        _broad_rule_check_result_list:function(){
            var self = this;
            var memList = [];
            var rows = $("#member_dg").datagrid("getData").rows;
            for ( var i = 0; i < rows.length; i++) {
                var data = $("#member_dg").datagrid('getData').rows[i];
                memList.push({
                    "memBillId": data.memBillId
                });
            }
            //添加宽带成员
            memList.push(self._broadInfo());
            var param1 = {
                "regionId" : cache.orderInfo.regionId,
                "masterInfo" : {
                    "masterBillId" : cache.orderInfo.masterInfo.masterBillId,
                    "masterName": cache.orderInfo.masterInfo.masterName
                },
                "operType" : "2", //传入成员校验成员传入户主校验户主， 当为1时，多校验户主的统一规则校验， 当为2时 即校验户主统一支付规则也校验成员的统一支付规则
                "membersList" : memList

            };
//			util.CommModule_loading("加载中");
            //broadRuleCheckResultList 该服务在/crm-ncrm/html/pc/busi/rboss/broadbandpre/js/dataUtils.js
            Rose.ajax.postJson(srvMap.get('broadRuleCheckResultList'), param1, function(json, status) {
//				util.CommModule_unloading();
                if(status){
                    if (json.isPass == "1") {
                        var param = {
                            "masterInfo": {
                                "masterBillId": cache.orderInfo.masterInfo.masterBillId
                            },
                            "membersList": memList
                        };
//						util.CommModule_loading("加载中");
                        //qryTyzfAddOrCreateGroup 该服务在/crm-ncrm/html/pc/busi/rboss/broadbandpre/js/dataUtils.js
                        Rose.ajax.postJson(srvMap.get('qryTyzfAddOrCreateGroup'), param, function(json, status) {
//							util.CommModule_unloading();
                            if(status){
                                $("#uniform_pay").addClass("btn-disabled");
                                $("#uniform_pay span").addClass("icon-add-grey").removeClass("icon-add");
                                var content = $('#warn_info_warn').val();
                                if (json.custOrderId != "") {
                                    if (content != "") {
                                        content += " 统一支付受理成功，客户订单编号：" + json.custOrderId;
                                    } else {
                                        content += "统一支付受理成功，客户订单编号：" + json.custOrderId;
                                    }
                                }
                                $('#warn_info_warn').val(content);
                                util.toastSuccess('添加统一支付成功', 1500, 'success');
                            } else {
                                util.messagerAlert(json.retMessage || "统一支付失败");
                            }
                        });
                    } else {
                        var rows = json.rows;
                        var str = "";
                        for ( var j = 0; j < rows.length; j++) {
                            str += " " + rows[j].billId + ":";
                            var errList = rows[j].ruleInfo.errList;
                            for ( var k = 0; k < errList.length; k++) {
                                str += errList[k].msg + "；";
                            }
                        }
                        util.messagerAlert(str);
                        var info = $("#check_info_check").val();
                        if (info != "") {
                            if (info.indexOf(str) == -1) {
                                if (info != "( 该输入框内容仅针对审核不通过有效  )") {
                                    $("#check_info_check").val(info + " " + str);
                                } else {
                                    $("#check_info_check").val(str);
                                }
                            }
                        } else {
                            $("#check_info_check").val(str);
                        }
                    }
                } else {
                    util.messagerAlert(json.retMessage || "统一支付失败");
                }
            });
        },
        //获取成员信息
        _getMember:function(){
            var self = this;
            var regionId = cache.orderInfo.regionId;
//			var membersList = cache.orderInfo.membersList;
            var membersList = cache.memBandList;
            var param = {};
            param.regionId = regionId;//地市
            param.membersList = membersList;//成员列表
            param.canClick = cache.menberClick;//是否可以点击
            param.showUniformPaymentBtn = true;//是否展示统一支付按钮
            param.masterBillId = cache.orderInfo.masterInfo.masterBillId;//户主billid
            param.masterName = cache.orderInfo.masterInfo.masterName;//户主名字
            param.broadbandAccount = cache.orderInfo.broadAcct;//宽带账号

            //添加了宽带成员后的回调
            param.broadInfoBloack = function(message){
                //宽带账号未通过校验 则置灰统一支付按钮和处理按钮
                //在提示区域展示
                self._handleBtnIsDisabled(true);
                self.uniform_pay_add_gray(true);
                self._setWarnText(message);
            }
            param.offerIdkd = cache.offerId;
            param.businessTypeCode = 2;
            BroadCommon.addMember._add_member(param);
            BroadCommon.addMember._add_delete_event(param);
        },
        //给成员添加宽带账号
        _add_broadband_bill:function(){
            var self = this;
            cache.memBandList = $.extend(true,cache.memBandList,cache.orderInfo.membersList);
            if (!cache.memBandList) {
                cache.memBandList = [];
            }
            var broadbandAccount = self._broadInfo();
            cache.memBandList.push(broadbandAccount);
        },
        //宽带成员
        _broadInfo:function(){
            return {
                "memBillId":cache.orderInfo.broadAcct,
                "memSpec":"BROAD"
            };
        },
        // 绑定修改／保存按钮事件
        _add_btn_event:function(){
            var self = this;
            $("#modify").off('click').on('click', function() {
                if($('#modify').hasClass('btn-disabled')){
                    return;
                }
                if(!cache.isBtnClick || cache.isChannel == "1" || cache.isCallCenter == "1") {
                    util.toastSuccess('此单不允许修改！', 1500, 'warn');
                    return;
                }
                self._modify_status_change(false);
                cache.modifyStatus = true;
            });
            $("#save").off('click').on('click', function() {
                if($('#save').hasClass('btn-disabled')){
                    return;
                }
                if ($("#add_number").attr("status") == 0) {
                    return;
                }
                if (!cache.modifyStatus) {
                    return;
                }
                self._save_btn_event('');
            });
        },
        //保存按钮逻辑
        _save_btn_event: function(callBack) {
            var self = this;
            if(!cache.isBtnClick || cache.isChannel == "1" || cache.isCallCenter == "1") {
                util.toastSuccess('此单不允许保存！', 1500, 'warn');
                return;
            }
            self._save_pre_order_detail(callBack);
        },

        _modify_status_change: function(disabledStatus) {
            var preDateDom = $('#other_info_pre_install_time');
            preDateDom.datebox({disabled:disabledStatus,value:preDateDom.datebox('getValue')});
            $("#add_number").attr("status", disabledStatus == true ? "0" : "1");
            if(disabledStatus) {
                $('#cont_info_cont_name,#cont_info_cont_num,#other_info_prepay_num,#remark_info_remark').attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor");
                $('#modify').removeClass('btn-disabled btn-small');
                $('#save').addClass('btn-disabled');
            } else {
                $('#cont_info_cont_name,#cont_info_cont_num,#other_info_prepay_num,#remark_info_remark').removeAttr('readonly').removeClass("readonly-disabled-bgcolor").removeAttr('disabled');
                $('#modify').addClass('btn-disabled').addClass('btn-small');
                $('#save').removeClass('btn-disabled');
            }
            //不需要加入校验，可以改
            var kindId = $('#offer_plan_broadband_name').combobox('getValue');//zhangmeng添加
            $('#offer_plan_broadband_name').combobox({disabled:disabledStatus});
            if(disabledStatus){
                $('#offer_plan_broadband_name').next().find("input").attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor");
            }else{
                $('#offer_plan_broadband_name').next().find("input").removeAttr('readonly').removeClass("readonly-disabled-bgcolor");
            }
            $('#offer_plan_broadband_name').combobox('setValue', kindId);
        },
        //联系人号码以及名称必须同时为空或者有值
        check_cont_emp:function(){
            var flag = false;
            if($("#cont_info_cont_name").val().trim().replace("（必填）",'') =="" || $("#cont_info_cont_num").val().trim().replace("（必填）",'') == ""){
                flag = true;
            }
            return flag;
        },
        //保存预受理订单
        _save_pre_order_detail: function(callBack) {
            var self = this;
            if(self.check_cont_emp()){
                util.toastSuccess("联系人和联系电话不能为空！", 1500, 'warn');
                return;
            }
            var contNumDom = $('#cont_info_cont_num');
            if(!self.validate._check_cont_num($(contNumDom))) {
                return;
            }
            var contNameDom = $('#cont_info_cont_name');
            if(!self.validate._check_cont_name($(contNameDom))) {
                return;
            }
            var param = this._get_save_param();
//			util.CommModule_loading("加载中");
            Rose.ajax.postJson(srvMap.get('savePreOrder'), param, function(json, status) {
//				util.CommModule_unloading();
                if (status) {
                    cache.modifyStatus = false;
                    self._modify_status_change(true);
                    self.marketKindId = $('#offer_plan_broadband_name').combobox("getValue");//保存最新的档次
                    self.marketKindName = $('#offer_plan_broadband_name').combobox("getText"); //保存最新的档次名称
                    //保存修改后的详单详情
                    cache.saveOrderInfo = param;
                    if(callBack) {
                        callBack();
                    } else {
                        util.toastSuccess('保存预受理订单成功', 1500, 'warn');
                    }
                } else {
                    util.messagerAlert(json.retMessage || "查询出错，联系维护人员");
                }
            });
        },
        _get_save_param: function() {
            var membersList = [];
            var trueMemberNum = 0;
            var canHandle = true;
            var allRows = $('#member_dg').datagrid('getRows');
            $.each(allRows, function(index, item) {
                if (item.isPass == 1) {
                    membersList.push({
                        "memBillId": item.memBillId,
                        "memName": item.memName,
                        "memSpec":"GSM",
                        "memType":"old"
                    });
                    trueMemberNum++;
                }else{
                    canHandle = false;
                }
            });
            if (cache.billMaxNum < trueMemberNum) {
                util.toastSuccess('成员数量超出可添加成员最大数量', 1500, 'warn');
                return;
            }
            if (cache.billMinNum > trueMemberNum) {
                util.toastSuccess('成员数量少于可添加成员最小数量', 1500, 'warn');
                return;
            }
            return {
                "preOrderId": preOrderId, // 预受理单编号
                "marketKindId": $('#offer_plan_broadband_name').combobox('getValue'), // 宽带档次
                "marketKindName": $('#offer_plan_broadband_name').combobox('getText'), // 档次名称
                "remarks": $('#remark_info_remark').val().trim(), // 备注
                "address": cache.orderInfo.address, // 标准地址名称
                "addressId": cache.orderInfo.addressId, // 标准地址编号
                "addressExt": cache.orderInfo.addressExt, // 补充地址
                "connectionType": cache.orderInfo.connectionName, // 接入方式
//				"regionId": cache.orderInfo.regionId, // 地市编号
                "countyId": cache.orderInfo.countyId, // 区县编号
                "contName": $('#cont_info_cont_name').val().trim().replace('（必填）', ''), // 联系人名称
                "contBillId": $('#cont_info_cont_num').val().trim().replace('（必填）', ''), // 联系电话
                "preDate": $('#other_info_pre_install_time').datebox('getValue'), // 预约时间
                "prepayBillId": $('#other_info_prepay_num').val().trim(), // 预缴号码	返还优惠时使用的号码
                "verifyOpinion": $('#check_info_check').val().trim(), // 审核意见
                "masterInfo":cache.orderInfo.masterInfo,
                "membersList":membersList,
                "canHandle": canHandle
            };
        },
        _loadView:function(){
            //联系人信息
            this._load_broad_user_info_module();
            //其他信息
            this._applyBroadOtherInfo();
            //备注
            this._load_broad_remark_info_module();

            //审核不通过
            this._load_check_no_pass_info_module();


        },
        //加载联系人
        _load_broad_user_info_module:function(){
            var self = this;
            BroadCommon.broadContInfo.init({
                node: "#user_info_handle",
                loadSuccess: function() {
                    $('.input-group.scd-label').hide();
                    $('#cont_info_cont_num').attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor");
                    $('#cont_info_cont_name').attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor");
                    $('#cont_info_cont_name').val(cache.orderInfo.contName);
                    $('#cont_info_cont_num').val(cache.orderInfo.contBillId);
                    var contNumDom = $('#cont_info_cont_num');
                    contNumDom.off('change').on('change', function(e) {
                        if(!self.validate._check_cont_num($(this))) {
                            return;
                        }
                    });
                    var contNameDom = $('#cont_info_cont_name');
                    contNameDom.off('change').on('change', function(e) {
                        if(!self.validate._check_cont_name($(this))) {
                            return;
                        }
                    });

                }
            });
        },
        //其他信息
        _applyBroadOtherInfo:function(){
            var self = this;
            BroadCommon.broadOtherInfo.init({
                node: ".busi-other-info",
                loadSuccess: function(){
                    $('#other_info_prepay_num').attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor");
                    $('#other_info_pre_install_time').datebox({"disabled":true});
                    $('#time_area').combobox({"disabled":true});
                    $('#other_info_prepay_num').val(cache.orderInfo.prepayBillId);
                    $('#other_info_pre_install_time').datebox('setValue', cache.orderInfo.preDate);
                    self._bind_prepay_num_change();
                },
                dateOnSelect: function(date) { // 预约安装时间选择回调
                    //时间组件用formatter
                    if (date) {
                        self.validate._check_install_time(date);
                    }
                }
            });
        },
        //绑定预缴号码事件
        _bind_prepay_num_change: function() {
            var self = this;
            var prepayDom = $('#other_info_prepay_num');
            self._country_mobile_tel_check(prepayDom);
        },
        //号码归属地查询校验
        _country_mobile_tel_check: function(node) {
            node.off('change').on('change', function(event) {
                dataUtils._post_data(srvMap.get('countryMobiletelCheck'), {billId: node.val()}, function(json,status) {
                    if(status) {
                        node.addClass('icon-success-tip');
                    }else{
                        node.removeClass('icon-success-tip');
                    }
                });
            });
        },
        /**
         * 加载备注信息
         * */
        _load_broad_remark_info_module: function() {
            var obj = {};
            obj.node = ".remarks-info";
            obj.loadSuccess = function(){
                $('#remark_info_remark').attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor").val(cache.orderInfo.remarks);
            }
            BroadCommon.broadRemarkInfo.init(obj);
        },
        /**
         * 加载提醒区
         * */
        _load_broad_warn_info_module: function(json){
            var self = this;
            var obj = {};
            obj.node = ".warn-info";
            obj.loadSuccess = function(){
                $('#warn_info_warn').attr('readonly', 'readonly');
                $('#warn_info_warn').val(cache.warnText);
                self._show_tv_message(json);
                $('#warn_info_warn').val(cache.warnText);
                self._get_device_type();

            }
            BroadCommon.broadWarnInfo.init(obj);
        },
        /**
         * 加载审核意见
         * */
        _load_check_no_pass_info_module: function(){
            var self = this;
            var obj = {};
            obj.btnDisabled = false;//按钮可编辑
            if (!cache.isBtnClick) {
                obj.btnDisabled = true;//按钮不可编辑
            }

            obj.node = '.check-info';
            obj.verifyOpinion = cache.orderInfo.verifyOpinion;
            obj.callback = function(value){
                self._noPass(value);
            };
            BroadCommon.checkNoPass.init(obj);
        },
        //审核不通过
        _noPass:function(value){
            var obj = {
                "preOrderId":preOrderId,
                "dealState":"2",//1-审核通过，转直接受理.2-审核不通过.3-录入取消
                "verifyOpinion":value
            };
            obj.postSuccess = function(json){
                window.close();
            };
            this._confirm(obj,"处理提示","确认审核不通过请选择”确定”，否则请选择“取消”");
        },

        //录入取消
        _cancelEntering:function(){
            //dealState:1-审核通过，转直接受理.2-审核不通过.3-录入取消
            var self = this;
            var obj = {
                preOrderId: preOrderId,
                dealState: "3"//2代表点击了审核不通过，3代表点击了录入取消
            };
            obj.postSuccess = function(json){
                //关闭页面
                window.close();
            };
            var tipsText = "确定取消录入请选择“确定”，否则请选择“取消”";
            if(cache.modifyStatus) {
                util.showPanel({
                    title: '提示',
                    content: '修改之后未保存，点确认将保存修改并取消录入，点取消将直接取消录入原订单',
                    closable: true,
                    confirmCallback: function(dialogNode) {
                        var callBack  = function(){
                            self._handle_event(obj);
                        };
                        self._save_pre_order_detail(callBack);
                        dialogNode.dialog('close');
                    },
                    cancelCallback: function(dialogNode) {
                        dialogNode.dialog('close');
                        self._confirm(obj,"处理提示",tipsText);
                    }
                });
            } else {
                this._confirm(obj,"处理提示",tipsText);
            }
        },
        //校验极光宽带服务
        _checkJuageSpeed:function(){
            var _self = this;
            var speedParam = {
                "billId":cache.orderInfo.broadAcct,
                "kindId":_self.marketKindId
            };
            dataUtils._post_data(srvMap.get('checkJuageSpeed'), speedParam, function(json,status) {
                if (status) {
                    _self._check_tv_again();
                }
            });
        },
        //处理前 再校验宽带电视
        _check_tv_again: function(){
            var self = this;
            var contNumDom = $('#cont_info_cont_num');
            if(!self.validate._check_cont_num($(contNumDom))) {
                return;
            }
            var contNameDom = $('#cont_info_cont_name');
            if(!self.validate._check_cont_name($(contNameDom))) {
                return;
            }
            //宽带电视校验
            var tvParam = {
                "billId":$('#cont_info_cont_num').val(),
                "kindId":self.marketKindId
            };
            self._check_tv(tvParam,function(json){
                self._show_tv_message(json,function(){
                    self._saveBeforeHandle();
                });
            });
        },

        /** 展示校验宽带电视信息
         * json 需要展示的信息
         * callback 可以继续下一步的回调
         * **/
        _show_tv_message:function(json,callback){
            var self = this;
            if(json.retCode == "200"){
                cache.haveTV = '0';
                callback && callback();
            }else if(json.retCode == "-1") {
                cache.haveTV = '1';
                if (!callback) {
                    dataUtils._post_data(srvMap.get('getCutRegion'),{extParam:cache.orderInfo.regionId},function(cutJson){
                        if(cutJson.ifCut == "true"){
                            self._setWarnText("请前往“宽带业务变更”以及“宽带电视开户”菜单办理，再提交受理结果！");
                        }else{
                            self._setWarnText("请前往“宽带业务变更”菜单办理，再提交受理结果！");
                        }
                        callback && callback();
                    });

                }
                callback && callback();
            }else if(json.retCode == "-2"){
                cache.haveTV = '1';
                util.messagerAlert(json.retMessage || "宽带电视联系人号码未通过校验！");
            }else if(json.retCode == "-3"){
                util.messagerAlert(json.retMessage || "校验宽带电视出错！");
            }else{
                util.messagerAlert(json.retMessage || "校验宽带电视出错，不允许继续处理！");
            }
        },
        //处理之前 如果没有保存 则先保存
        _saveBeforeHandle:function(){
            var _self = this;
            if (cache.modifyStatus) {
                _self._save_btn_event(function() {
                    _self._informationHandle();
                });
            }else{
                _self._informationHandle();
            }
        },
        //信息处理
        _informationHandle:function(){
            var self = this;
            //dealState:1-审核通过，转直接受理.2-审核不通过.3-录入取消
            var obj = {
                "preOrderId":preOrderId,
                "dealState":"1"
            };
            //如果是宽带电视 1 有宽带电视  0 没有宽带电视
            if (cache.haveTV == '1') {
                self._confirm(obj,"处理提示","如订单已处理成功，请点击“确定”；如订单还未处理，请点击“取消”继续处理");
            }else{
                //前端校验成员列表有没有不通过的成员
                var flag = self._checkNoPassMember();
                if (flag == false) {
                    util.toastSuccess('存在没有通过校验的成员，请处理！', 1500, 'warn');
                    return;
                }
                //先保存
                self._rule_pre_check();
            }
        },

        //先规则校验再进入页面
        _rule_pre_check:function(){
            var self = this;
            cache.saveOrderInfo = self._get_save_param();
            if (!cache.saveOrderInfo.canHandle) {
                util.toastSuccess('存在没有通过校验的成员，请处理！', 1500, 'warn');
                return;
            }
            // 群组组网正式受理业务进菜单校验
            var userList = [];
            userList.push({
                "roleId":"22",    // 家长
                "busiCode":"800015101181",// 大操作编码下对应的小操作编码
                "billId": cache.saveOrderInfo.masterInfo.masterBillId// 家长号码
            });
            var datas = $("#member_dg").datagrid('getData').rows;
            for ( var i = 0; i < datas.length; i++) {
                var data = $("#member_dg").datagrid('getData').rows[i];
                userList.push({
                    "roleId":"24",    // 手机成员
                    "busiCode":"800015101184",// 大操作编码下对应的小操作编码
                    "billId":data.memBillId// GSM成员号码
                });
            }
            //添加宽带成员
            userList.push({
                "roleId":"500000010111",    // 宽带成员角色
                "busiCode":"800015101184",// 大操作编码下对应的小操作编码
                "billId":cache.orderInfo.broadAcct// GSM成员号码
            });
            var param = {
                "billId" : cache.saveOrderInfo.masterInfo.masterBillId,
                "businessId" : "800015101181",
                "kindId": cache.saveOrderInfo.marketKindId,//群组档次编号
                "opType" : "6",//0：全部；1：产品属性；2：产品定义；3：前项限制；4：后项限制；5:互斥依赖；6：业务操作；7:参数合法性校验；如需同校验某几个以逗号隔开即可，如：1,2,5  (必填)
                "chkBaseRule":'0',//通常是用在进入菜单时进行业务规则预判的校验1：是，0或空：不是
                "userList" : userList
            };
            //checkPreOrSmtPc 该服务在/crm-ncrm/html/pc/busi/rboss/broadbandpre/js/dataUtils.js
            dataUtils._post_data(srvMap.get('checkPreOrSmtPc'),param,function(json, status){
                if (status) {
                    if (json.errList.length != 0) {
                        util.messagerAlert(json.retMessage || "规则校验不通过");
                    } else {
                        cache.planInfo = json;
                        self._qry_band_offers();

                    }
                } else {
                    util.messagerAlert(json.retMessage || "转正式受理规则校验服务出错");
                }
            });
        },
        /**
         * obj 请求的上传参数
         * title 二次确认title
         * content 二次确认内容
         * */
        _confirm:function(obj,title,content){
            var self = this;
            var confimObj = {};
            confimObj.title = title || "处理提示";
            confimObj.content = content || "如订单已处理成功，请点击“确定”；如订单还未处理，请点击“取消”继续处理";
            confimObj.confirmCallback = function(node){
                $(node).dialog('close');
                self._handle_event(obj);
            };
            confimObj.cancelCallback = function(node){
                $(node).dialog('close');
            };
            util.showPanel(confimObj);
        },
        /** 处理事件公共方法
         * dealState 处理状态
         * preOrderId 预受理ID
         * postSuccess 加载成功的回调
         * doubleHandle 是重复处理的回调
         * **/
        _handle_event:function(obj){
            //查重校验
            var param = {
                "busiType":"2",
                "qry":{
                    "preOrderId":obj.preOrderId
                }
            }
            //重复校验
            dataUtils._bouble_check(param,function(json){
                if (json.retCode == '200') {
                    //不存在重复处理
                    var subParam = obj;
                    dataUtils._du_submint(subParam,function(json, status) {
                        obj.postSuccess && obj.postSuccess(json);
                    });
                }else{
                    //存在重复处理
                    util.messagerAlert(json.errMsg,"提示信息");
                    obj.doubleHandle && obj.doubleHandle(json);
                }
            });
        },

        /*********************************************************************/
        /**************************开始************************************/
        _applyBusi:function(){
            var self = this;


            this._get_product_info();
            this.showAccountRealCertType(function() {
                //初始化公共模块
                self._load_common_module();
            });
        },
        //根据档次ID获取产品信息
        _get_product_info:function(){
            var self = this;
            var obj = {
                "kindId":self.marketKindId  //zhangmeng
            };
            obj.node = '#product_info';
            obj.groupMeal = self.marketKindName;  //zhangmeng
            obj.effectTime = "true";
            obj.businessId = cache.businessId;//宽带改套餐
            obj.broadAcct = cache.orderInfo.broadAcct;
            obj.connectionType = cache.orderInfo.connectionType;
            obj.regionId = cache.orderInfo.regionId;
            obj.isNeedShowCost = false;
            obj.offersback = function(json){
                //产品信息和策划信息回调 暂未使用
                self._load_band_offer_info(json.offers);
                if(cache.fusionEffType == "2"){
                    var timeShow = cache.broadVasExpTime.substring(0,4) + "-" + cache.broadVasExpTime.substring(4,6) + "-" + cache.broadVasExpTime.substring(6,8) ;
                    $('#effectiveTime').val(timeShow);
                }
            };
            BroadCommon.productInfo.init(obj);
        },
        /**
         *
         * var self = this;
         var obj = {};
         var offerList = [];
         for ( var int = 0; int < json.offers.length; int++) {
				var offer = json.offers[int];
				offer.operateType = '1';
				offerList.push(offer);
			}
         obj.offerList = offerList;//策划信息
         obj.billId = self.object.broadAcct;//宽带账号
         obj.businessId = self.object.businessId;//业务编码
         obj.connectionType = self.object.connectionType;//接入方式
         obj.regionId = self.object.regionId;//地市
         * */
        //初始化宽带策划信息
        _load_band_offer_info: function(offers) {
            var self = this;
            var offerList = [];
            for ( var i = 0; i < offers.length; i++) {
                offerList.push({
                    "offerId": offers[i].offerId,
                    "operateType":"1"
                });
            }
            BroadCommon.offersInfo.init({
                node: "#empty_offers",
                businessId: cache.fusionEffType == "2"? "500000020340" : cache.businessId,
                preContinueTime:cache.fusionEffType == "2" ? cache.broadVasExpTime :"",
                billId: cache.orderInfo.broadAcct,
//				countyId: cache.orderInfo.countyId,//县市id
                connectionName: cache.baseAddrInfo ? $('#band_info_connect_type').combobox('getText') : cache.orderInfo.connectionName,
                connectionType: cache.baseAddrInfo ? $('#band_info_connect_type').combobox('getValue') : cache.orderInfo.connectionType,
                cooperation: cache.baseAddrInfo ? cache.baseAddrInfo.cooperatorName : cache.orderInfo.cooperation,
                cooperationId: cache.baseAddrInfo ? cache.baseAddrInfo.cooperatorType : cache.orderInfo.cooperationId,
                regionId: cache.orderInfo.regionId,
                offerList: offerList,
                loadSuccess: function() {
                },
                needOtherOffers: false, // 需要订购增值策划
                isNeedToCheckFeeInfo: true,//是否需要费用信息å
                showOffers: true, // 裸宽组网业务，策划列表不展示基本策划信息的（只展示增值策划）的标识
                forExpenseOffers: offers, // 从产品部分返回的策划列表，用于查询宽带费用
                qryFeeInfoByKindId : cache.qryFeeIsChange ? true:false,
                kindId:self.marketKindId,
                feeInfoErrCallback : function(){
                    $('#commit_accept').addClass('btn-disabled');
                },
                "commitBtn":"#commit_accept"
            });
        },
        //公共模块信息
        _load_common_module:function(){
            var remarks = $('#remark_info_remark').val();
            commObj.agent.init("",remarks);
            var obj={
                callback:function(){
                    if(cache.orderInfo.marketOpName&&cache.orderInfo.marketOpCode){
                        $("#familynet_referee").find('.panel-tool').find('.accordion-expand').click();
                        $("#detailed_referee_query").addClass('none');
                        $("#referee_query").val(cache.orderInfo.marketOpName).attr('readonly', 'readonly').addClass("readonly-disabled-bgcolor");//推荐人的名称
                        $("#referee_combo .suggest_box_field dd.selected-item").attr("data",cache.orderInfo.marketOpCode);//推荐人的Id
                    }
                }
            };
            commObj.referee.init(obj);
            commObj.responsible.init({certType: cache.orderInfo.certType}); //初始化经办人
        },

        // 调用组件展示证件类型
        showAccountRealCertType: function(callback){
            var self = this;
            var params = {
                "certTypeFlag": "2",// 类型标志为1,表示CM_CUST_CERT_TYPE对应的身份类型，
                //类型标志为2,表示CM_CUST_CERT_TYPE_FOR_KH对应的身份类型
                // 类型标志位3，表示使用人、经办人的证件列表，其它出错
                "pageCode": "broadbandOpen"//kdkh宽带开户，GSM_OPEN
            };
            Rose.ajax.postJson(srvMap.get("getRealCertInfo"), params, function(json, statue) {
                if (statue) {
                    //初始化代办人和经办人的身份识别按钮和手工录入按钮
                    self._init_identity_btn_and_hand_btn(json, callback);
                } else {
                    util.toastSuccess(json.retMessage || "操作员权限获取失败", 1500, 'warn');
                }
            });
            require.async('commonBusi/oldCrmOpenBank', function() {
                self._bind_open_bank_btn();
            });
        },
        _bind_open_bank_btn: function() {
            $(document).off('click', '.manualInputApply').on('click', '.manualInputApply', function(){
                var buttonId = $(this).attr('buttonId');
                //判断能否完成金库审批
                var result = approveBankNew(buttonId);
                if(result){
                    util.toastSuccess("金库库审批成功,您可以手工录入了！", 1500, 'warn');
                    $('input.apply_tip').removeAttr('disabled').removeClass('apply_tip');
                    $('.manualInputApply').remove();
                    window.cache['bankIsPass'] = true;
                }else{
                    util.toastSuccess("金库库审批失败！", 1500, 'warn');
                    window.cache['bankIsPass'] = false;
                }
            });
        },
        //初始化代办人和经办人的身份识别按钮和手工录入按钮
        _init_identity_btn_and_hand_btn: function(json, callback) {
            var self = this;
            $('.manualInputApply').attr('buttonId', json.buttonId);
            self.initCertStatus(json);
            callback && callback();
        },

        /**
         * 初始化证件状态（是否置灰）
         */
        initCertStatus: function(json) {
            window.cache['byHands'] = json.byHands;
            window.cache['isAuthority'] = json.printUrl.isAuthority;
            if(json.printUrl && json.printUrl.isAuthority === "true") {
                $('#check_id_card').removeClass('none');
            }
            if(json.byHands === 'true'){
                $('.manualInputApply').removeClass("none");
                var ipts = [];
                var parentDOM = $('.manualInputApply').parents('.busi-info');
                //客户经办人信息
                ipts.push($("#reponsible_cert_number"));
                ipts.push($("#reponsible_user_name"));
                for(var i=0,len=ipts.length; i<len; i++){
                    //如果原本就是不可编辑的,则不添加apply_tip（用户恢复可编辑状态的控制）标志
                    if($(ipts[i]).attr('disabled') != 'disabled'){
                        $(ipts[i]).attr('disabled','disabled').addClass('apply_tip');
                    }
                }
            }else{
                $('.manualInputApply').remove();
            }
        },

        /**
         * 受理提交
         * */
        _band_to_fusion:function(){
            var self = this;
            if($('#commit_accept').hasClass("btn-disabled")){
                return;
            }
            var param = this._checkCommit();
            var btn = $("#commit_accept");
            if(btn.hasClass("beenClick")){
                return;//防止 二次提交
            }else{
                btn.addClass("beenClick")
            }
            dataUtils._subGroupBusiness(srvMap.get('subGroupBusiness'), param, function(json, status) {
                crumbs.nextStep();
                if(status) {
                    self._submit_success(json);
                    var billId = cache.orderInfo.masterInfo.masterBillId;
                    require.async('commonBusi/Comm.js', function() {
//						CommModule.loadPrint({
//							billId: billId,
//							RESULT_CODE: "0",
//							createDate: json.createDate,
//							custOrderId: json.custOrderId,
//							pageCode: 'broadbandChange'
//								//TODO
//						});
                        CommModule.chkRealTimePrint({
                            billId: billId,
                            oldOrderId: json.custOrderId,
                            //TODO
                            pageCode: 'broadbandChange',
                            printBtn: '.ui-success-btn .ui-error-callback:eq(1)'
                        });
                    });
                } else {
                    self._submit_fail(json);
                }
            });
        },

        //校验上传参数
        _checkCommit:function(){
            var self = this;
            var param = {};
            param.preOrderId = preOrderId;
            //param.marketId = cache.orderInfo.marketId;  zhangmeng
            param.marketKindId = self.marketKindId; //营销案档次编号 订单详情没有   //zhangmeng
            param.masterInfo = cache.orderInfo.masterInfo;
            param.memberList = self._getMemberList();
            param.ordAgentInfo = self.retAgentInfo(); //代办人信息
            param.ordHandleInfo = self.retHandler(); //经办人信息
            param.remarks =  $('#orderRemark').val().replace('您还有其他的留言备注吗?(100字以内)','') || '';
            param.saleId = $("#referee_combo .suggest_box_field dd.selected-item").attr("data");//销售员编号
            param.authNo = "";//认证流水号
            return param;
        },
        //获取成员信息
        _getMemberList:function(){
            var memberList = [];
            //宽带账户
            var member0 = {};
            member0.memberBillId = cache.orderInfo.broadAcct;
            member0.memberSpec = "2";//1：手机4：固话2：宽带
            member0.isNew = "N";//是否新开户	Y:是N:否
            member0.isChangeOffer = "Y";//是否换套餐	Y:是N:否
            var planInfo = this._getOffersList();
            member0.addList = planInfo.addList;
            member0.delList = planInfo.delList;
            member0.broadInfo = this._getBroadInfo();
            var salerId = $("#referee_combo .suggest_box_field dd.selected-item").attr("data");//销售员编号
            member0.SalerInfo = {
                "salerId":salerId,
                "salerName":""
            };
            memberList.push(member0);
            //手机成员
            var info = this._getLastInfo();
            for ( var int = 0; int < info.membersList.length; int++) {
                var temp = info.membersList[int];
                var member = {};
                member.memberBillId = temp.memBillId;
                member.memberSpec = temp.memSpec;//1：手机4：固话2：宽带
                member.isNew = "N";//是否新开户	Y:是N:否
                member.isChangeOffer = "N";//是否换套餐	Y:是N:否
                memberList.push(member);
            }
            return memberList;
        },
        _getOffersList:function(){
            var offersInfo = BroadCommon.offersInfo.getOffersForOther();
            var offers = offersInfo.offers.offers;
            var planInfo = {};
            var addList = [];
            var delList = [];
            for ( var int = 0; int < offers.length; int++) {
                var offer = offers[int];
                if (offer.isSelected == "1") {
                    if (offer.operateType == '1') {
                        var addInfo = {};
                        addInfo.offerId = offer.offerId;//策划编号
                        addInfo.offerType = offer.offerType;//策划类型
                        addInfo.effExpDate = offer.effExpDate;//生失效时间
                        addInfo.effectiveType = offer.effectiveType;//生效类型
                        addInfo.expireType = offer.expireType;//失效类型
                        addInfo.expireArg = offer.expireArg;//失效参数，如失效周期
                        addInfo.productInfos = offer.productInfos;//策划下产品列表 //产品需要和服务一致
                        //添加费用信息
                        var pricePlanList = this._getPricePlans(offer.offerId);
                        if (!($.isEmptyObject(pricePlanList))) {
                            addInfo.feeDetails = pricePlanList;
                        }
                        addList.push(addInfo);
                    }else if (offer.operateType == '2') {
                        var delInfo = {};
                        delInfo.offerInstId = offer.offerInstId;
                        delInfo.operType = "1";//操作类型	1：退订2：终止3：反撤
                        delInfo.offerId = offer.offerId;
                        delInfo.effExpDate = offer.effExpDate;
                        delInfo.effectiveType = offer.effectiveType;//生效类型
                        delInfo.expireType = offer.expireType;//失效类型
                        delInfo.expireArg = offer.expireArg;//失效参数，如失效周期
                        delInfo.productInfos = offer.productInfos;//策划下产品列表 //产品需要和服务一致
                        //添加费用信息
                        var pricePlanList = this._getPricePlans(offer.offerId);
                        if (!($.isEmptyObject(pricePlanList))) {
                            delInfo.feeDetails = pricePlanList;
                        }
                        delInfo.feeDetails = pricePlanList;
                        delList.push(delInfo);
                    }
                }
            }
            planInfo.addList = addList;
            planInfo.delList = delList;
            return planInfo;
        },
        _getBroadInfo:function(){
            var obj = {
                broadAddressId: cache.orderInfo.addressId,//标准地址编号
                broadAddress: cache.orderInfo.address,//安装地址	is_new为true是必填
                broadAddressExt: cache.orderInfo.addressExt,//补充地址
                countyCode: cache.orderInfo.countyId,//用户归属县市（安装地址的县市）
                connectionType: cache.orderInfo.connectionType,//接入方式	接入方式
                broadCooperator: cache.orderInfo.cooperationId//合作伙伴	合作伙伴
            };
            var info = this._getLastInfo();
            obj.preDate = info.preDate;//预约安装时间
            obj.extendList = [{
                "value":$('#other_info_prepay_num').val().trim(), //	扩展参数值	0：否1：是
                "text":"101402"//101402预缴手机号码
            }];
            obj.contInfo = {
                "contName":info.contName,//联系人姓名
                "contBillId":info.contBillId//联系人电话
            };
            return obj;
        },
        //如果有修改保存，则返回修改保存的数据
        //没有修改，则返回原来的数据
        _getLastInfo:function(){
            var info = cache.orderInfo;
            if (!$.isEmptyObject(cache.saveOrderInfo) && cache.modifyStatus == false) {
                info = cache.saveOrderInfo;
            }
            return info;
        },
        //获取费用表格信息
        _getPricePlans:function(offerId){
            //获取表格所有行
            if (!($('#expense_info').find(".datagrid"))) {
                return ;
            }
            var allRows = $('#expense_information').datagrid('getRows');
            var pricePlans = [];
            $.each(allRows, function(index, item) {
                if(item.offerId === offerId) {
                    var pricePlan = {};
                    var discountTypes = [];
                    pricePlan.pricePlanId = item.pricePlanId;
                    pricePlan.shouldMoney = item.shouldMoney;
                    pricePlan.factMoney = item.factMoney;
                    pricePlan.discountMoney = item.discountMoney;
                    var selectVal =  $('#expense_info').find('tr[datagrid-row-index=' + index + '] td[field=discountTypes] select').combobox('getValue');
                    var selectText = $('#expense_info').find('tr[datagrid-row-index=' + index + '] td[field=discountTypes] select').combobox('getText');
                    discountTypes.push({"value": selectVal, "text": selectText});
                    pricePlan.discountTypes = discountTypes;
                    pricePlan.discountType = selectVal;
                    pricePlans.push(pricePlan);
                }
            });
            return pricePlans;
        },
        //获取代办人信息
        retAgentInfo: function() {
            var agentInfo = {};
            var certTypeId = $("#cert_type").combobox('getValue'); //证件编号
            var certCode = $("#cert_number").val();   //证件号码
            var codeDefalult = $("#cert_number").attr("defaultchars");
            var certName = $("#JS_agentInfoUserName").val();  //用户姓名
            var nameDefault = $("#JS_agentInfoUserName").attr("defaultchars");
            if (certCode == "" || certCode == codeDefalult) {
                certCode = "";
            }
            if (certName == "" || certName == nameDefault ) {
                certName = "";
            }
            agentInfo["certType"] = certTypeId;
            agentInfo["certCode"] = certCode;
            agentInfo["agentPerson"] = certName;
            return agentInfo;
        },
        //获取经办人信息
        retHandler: function() {
            var handlerInfo = {};
            var certTypeId = $("#reponsible_cert_type").combobox('getValue'); //证件编号
            var certCode = $("#reponsible_cert_number").val();   //证件号码
            var codeDefalult = $("#reponsible_cert_number").attr("defaultchars");
            var certName = $("#reponsible_user_name").val();  //经办人姓名
            var nameDefault = $("#reponsible_user_name").attr("defaultchars");
            var certAddress = $("#reponsible_additions_address").val();  //经办人地址
            var certAddressDefault = $("#reponsible_additions_address").attr("defaultchars");
            if (certCode == "" || certCode == codeDefalult) {
                certCode = "";
            }
            if (certName == "" || certName == nameDefault ) {
                certName = "";
            }
            if (certAddress =="" || certAddress == certAddressDefault ) {
                certAddress = "";
            }
            handlerInfo["certType"] = certTypeId;
            handlerInfo["certCode"] = certCode;
            handlerInfo["handlePerson"] = certName;
            handlerInfo["certAddress"] = certAddress;
            return handlerInfo;
        },

        // 受理提交成功
        _submit_success: function(json) {
            var broadbandpwd = $('#band_attr_info_band_id').attr('broadbandpwd');
            var obj = {
                title: "宽带续包裸宽续融合",
                message: "订单号：" + json.custOrderId,
                callbackList: [{
                    name: "关闭",
                    action: function() {
                        window.returnValue = JSON.stringify({"retCode": "200"});
                        window.close();
                        return;
                    }
                },{
                    name: "打印收据",
                    action: function() {
                    }
                }]
            }
            $('.page-container').addClass('none');
            util.success(obj);
        },
        // 受理提交失败
        _submit_fail: function(json) {
            var errList = [{
                "msg": json.retMessage
            }];
            var obj = {
                title: "宽带续包裸宽续融合",
                errList: errList,
                callback: function() {
                    $('.ui-error-tpl').remove();
                    $('#common_show_error_page').empty();
                    $("#commit_accept").removeClass("beenClick");//去掉 为防重复点击事件 而增加的标志
                    crumbs.prevStep();
                    return;
                }
            }

            $('.page-container').addClass('none');
            util.fail(obj);
        },

        /*********************************************************************/
        /*****************************结束********************************/



        /****************************一些工具***************************************/
        validate : {
            //校验预约安装时间
            _check_install_time: function(date) {
                if(date <= new Date()) {
                    util.CommontoolTips("预约时间应大于当前时间，请重新选择预约时间！", $('#other_info_pre_install_time').next());
                    $('#other_info_pre_install_time').datebox('setValue', '');
                }
            },
            _check_submit_event: function() {
                return true;
            },
            //校验联系人号码
            _check_cont_num: function($ele) {
                var contNum = $ele.val().replace('（必填）', '').trim();
//					if(isNaN(contNum) || contNum.length >= 20) {
//						util.CommontoolTips("联系电话输入不合法！", $ele);
//						$ele.val("");
//						return false;
//					}
                if(isNaN(contNum)) {
                    util.CommontoolTips("联系电话必须为数字！", $ele);
                    return false;
                }
                if(contNum.length < 6) {
                    util.CommontoolTips("联系电话不能小于6位！", $ele);
                    return false;
                }
                if(contNum.length > 15) {
                    util.CommontoolTips("联系电话不能大于15位！", $ele);
                    return false;
                }
                return true;
            },
            //校验联系人姓名
            _check_cont_name: function($ele) {
                var contName = $ele.val().replace('（必填）', '').trim();
                var regExp = /^([A-Za-z]|[\u4E00-\u9FA5])+$/;
                if (!regExp.test(contName)) {
                    util.CommontoolTips("联系人姓名必须为汉字或者字母！", $ele);
                    return false;
                }
                if (contName.length > 100) {
                    util.CommontoolTips("联系人姓名最大长度为100！", $ele);
                    return false;
                }
                return true;
            }
        },
        //处理按钮置灰 disabled=true 不可点击 false 可点击
        _handleBtnIsDisabled:function(disabled){
            if (disabled == true) {
                $('#handle').addClass("btn-disabled");
            }else{
                $('#handle').removeClass("btn-disabled");
            }
        },
        //往提醒区添加文字 text新增加的文字
        _setWarnText:function(text){
            if(!this.isEmptyString(text)){
                cache.warnText = cache.warnText + " " + text;
            }
            $('#warn_info_warn').val(cache.warnText);
        },
        //校验不通过成员
        _checkNoPassMember:function(){
            var allRows = $('#member_dg').datagrid('getRows');
            $.each(allRows, function(index, item) {
                //不通过
                if (item.rule == 0) {
                    //跳出所有循环
                    return false;
                }
            });
            return true;
        },
        //是否是空字符串 string要校验的字符串
        isEmptyString:function(string){
            if (string == '' || string == null || string == undefined  ) {
                return true;
            }
            return false;
        },
        uniform_pay_add_gray:function(){
            $("#uniform_pay").attr("masterStatues", "0").addClass("btn-disabled");
            $("#uniform_pay span").addClass("icon-add-grey").removeClass("icon-add");
        }
        /****************************一些工具*结束**************************************/
    };
    return bandToFusion;
}
//获得当前时间
function getCurrentEndTimeFormatTime() {
    var month = new Date().getMonth() + 1;
    var day = new Date().getDate();
    var year = new Date().getFullYear();
    return year + "-" + month + "-" + day;
}
