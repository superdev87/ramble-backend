const Order = require("../models/orders");
const DocumentTypes = require("../models/documenttypes");
const OrderBoost = require("../models/orderboost");
const HcchMember = require('../models/hcchmembers');
const Currentorderstatus = require('../models/order_event_types');
const { sendError, processItem, randomcode } = require("../utils/utils");
/**
 * generate random integer not greater than `max`
 */

function rand (max) {
    return Math.floor(Math.random() * max)
  }
  
  /**
   * generate random character of the given `set`
   */
  
  function random (set) {
    return set[rand(set.length - 1)]
  }
  
  /**
   * generate an array with the given `length` 
   * of characters of the given `set`
   */
  
  function generate (length, set) {
    var result = []
    while (length--) result.push(random(set))
    return result
  }
  
  /**
   * shuffle an array randomly
   */
  function shuffle (arr) {
    var result = []
  
    while (arr.length) {
      result = result.concat(arr.splice(rand[arr.length - 1]))
    }
  
    return result
  }
  /**
   * do the job
   */
  
  const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };
  
  const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    //Remove the password from the output
    user.password = undefined;
  
    console.log({ user, token });
    res.status(statusCode).json({
      status: "success",
      data: {
        token,
        user,
      },
    });
  };
  
  const generatePassword = (len) => {
  
      function password (length) {
        var result = [] // we need to ensure we have some characters
        result = result.concat(generate(1, specials)) // 1 special character
        result = result.concat(generate(1, upper)) // 1 upper case
        result = result.concat(generate(1, lower)) // 1 lower case
        result = result.concat(generate(1, digit)) // 1 digit
        result = result.concat(generate(length - 4, all)) // remaining - whatever
  
        return shuffle(result).join('') // shuffle and make a string
      }
      return password(len)
  }
  
  const generateID = (len) => {
  
    function id (length) {
      var result = [] // we need to ensure we have some characters
      result = result.concat(generate(length, digit)) // 1 digit
  
      return shuffle(result).join('') // shuffle and make a string
    }
    return id(len)
  }
exports.getDocumentTypes = async(req, res) => {
    const { language } = req.query;
    try {
        const typeList = await DocumentTypes.find({nm_sitelanguages:language});
        res.status(200).json({
            status: "success",
            typeList,
        });
    } catch (error) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.getOrderBoostList = async(req, res) => {
    const { language, currency } = req.query;
    try {
        const boostlist = await OrderBoost.find({nm_sitelanguages:language, nm_countrycurrency:currency});
        res.status(200).json({
            status: "success",
            boostlist,
        });
    } catch (error) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.getorderbyid = async(req, res) => {
    const { orderid } = req.query;
    try {
        let order = await Order.findById(orderid).populate('id_customer').populate('id_researcher').populate({path:'id_documenttype', select:'nm_documenttype'});
        let orderstatuslist = await Currentorderstatus.find({});
        res.status(200).json({
            status: "success",
            order,
            orderstatuslist
        });


    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.createorder = async(req, res) => {
    let params = req.body;
    try {
        let newOrder = new Order(params);
        newOrder.cd_order = generateID(10);
        await newOrder.save();
        res.status(200).json({
            status: "success",
            newOrder,
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }

    
}

exports.setOrderBoost = async(req, res) => {
    let params = req.body;
    try {
        let order = await Order.findOne({_id: params._id})
        if(!order){
            return sendError(req, res, 404, `A ordem não existe.`);
        }
        order.id_orderboost = params.id_orderboost;
        await order.save();
        res.status(200).json({
            status: "success",
            newOrder: order,
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.checkHcchMember = async(req, res) => {
    let { cd_country } = req.query;
    try {
        let country_cd = await HcchMember.findOne({cd_country: cd_country});
        
        if(!country_cd){
            return sendError(req, res, 404, `Não é Membro Hcch.`);
        }
        res.status(200).json({
            status: "success"
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.addHcchMember = async(req, res) => {
    let countries = "AL,AD,AR,AM,AU,AT,AZ,BY,BE,BA,BR,BG,BF,CA,CL,CN,CR,HR,CY,CZ,DK,DO,EC,EG,SV,EE,FI,FR,GE,DE,GR,HN,HU,IS,IN,IE,IL,IT,JP,JO,KZ,LV,LT,LU,MY,MT,MU,MX,MC,MN,ME,MA,NA,NL,NZ,NI,MK,NO,PA,PY,PE,PH,PL,PT,KR,MD,RO,RU,SA,RS,SG,SK,SI,ZA,ES,LK,SR,SE,CH,TH,TN,TR,UA,GB,US,UY,UZ,VE,VN,ZM"
    Promise.all(countries.split(',').map(async (item) => {
        await HcchMember.create({cd_country: item});
    }))
    res.status(200).json({
        status: "success",
    });
}

exports.submitclientid = async (req, res) => {
    let {allowUsers, _id} = req.body;
    try {
        let order = await Order.findOne({_id: _id})
        if(!order){
            return sendError(req, res, 404, `A ordem não existe.`);
        }
        order.allowUsers = allowUsers;
        await order.save();
        res.status(200).json({
            status: "success",
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.getorderwithresearcher = async(req, res) => {
    let { id_researcher } = req.query;
    try {
        let orders = await Order.find({id_researcher: id_researcher}).populate({path:'id_customer', select:'nm_user'}).populate({path:'id_documenttype', select:'nm_documenttype'}).select('id_customer id_documenttype createdAt bids vl_budget cd_orderstatus cd_statusflag tp_order updatedAt nm_ancestor')
        if(orders.length === 0){
            return sendError(req, res, 404, `A ordem não existe.`);
        }
        
        res.status(200).json({
            status: "success",
            orders
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.getorderwithclient = async(req, res) => {
    let { id_customer } = req.query;
    try {
        let orders = await Order.find({id_customer: id_customer}).populate({path:'id_customer', select:'nm_user'}).populate({path:'id_documenttype', select:'nm_documenttype'}).select('id_researcher id_documenttype createdAt bids vl_budget cd_orderstatus cd_statusflag tp_order updatedAt nm_ancestor')
        if(orders.length === 0){
            return sendError(req, res, 404, `A ordem não existe.`);
        }
        
        res.status(200).json({
            status: "success",
            orders
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.getordercntwithclient = async(req, res) => {
    let { id_customer } = req.query;
    try {
        let total = await Order.count({id_customer: id_customer})
        let opened = await Order.count({id_customer: id_customer, cd_orderstatus:0})
        let progress = await Order.count({id_customer: id_customer, cd_orderstatus:1})
        let concluded = await Order.count({id_customer: id_customer, cd_orderstatus:2})

        res.status(200).json({
            status: "success",
            total,
            opened,
            progress,
            concluded
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.getordercntwithresearcher = async(req, res) => {
    let { id_researcher } = req.query;
    try {
        let total = await Order.count({id_researcher: id_researcher})
        let opened = await Order.count({id_researcher: id_researcher, cd_orderstatus:0})
        let progress = await Order.count({id_researcher: id_researcher, cd_orderstatus:1})
        let concluded = await Order.count({id_researcher: id_researcher, cd_orderstatus:2})

        res.status(200).json({
            status: "success",
            total,
            opened,
            progress,
            concluded
        });

    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.addevent = async (req, res) => {
    let params = req.body;
    try {
        let order = await Order.findById(params.id);
        order.event.push(params.event);
        order.dt_lastupdatedevent = new Date();
        await order.save();

        res.status(200).json({
            status: "success",
            order
        });

    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}

exports.addproblemevent = async (req, res) => {
    let params = req.body;
    try {
        let order = await Order.findById(params.id);
        order.event.push(params.event);
        order.event.map((item, index) => {
            if(index == params.confirmEvent) order.event[index].ic_confirmed = true;
        })
        await order.save();

        res.status(200).json({
            status: "success",
            order
        });

    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
}