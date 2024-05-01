const mongoose = require('mongoose');
const {Schema}  = mongoose ;

const order_schema = new Schema({
    id_customer: {type: Schema.Types.ObjectId, ref: "users"},
    //id_country: {type: Schema.Types.ObjectId, ref: "countries"},
    id_researcher: {type: Schema.Types.ObjectId, ref: "users"},
    id_documenttype: {
        type: Schema.Types.ObjectId, ref: "document_types"
    },
    id_orderboost:[{
            type: Schema.Types.ObjectId, ref: "orderboosts"
    }],
    nm_documentcountry: {
        type:String,
        required: true,
    },
    nm_documentlocation: String,
    nm_otherdocument: {
        type:String,
    },
    cd_order: String,
    nm_ancestor: {
        type:String,
        required: true,
    },
    ds_gender: {
        type:String,
        required: true,
    },
    ic_digitaldocument: {
        type:Boolean,
        required: true,
    },
    ic_physicaldocument: Boolean,
    ic_stampeddocument: Boolean,
    ds_familysearchprofile: {
        type:String,
    },
    nm_ancestoralternative: [{type: String}],
    family_members: {
        nm_spouse: String,
        nm_father: String,
        nm_mother: String,
        nm_otherperson: String,
        ds_otherpersonfamiliarity: String,
    },
    life_event_dates : {
        baptism: {
            dt_baptism: Date,
            dt_baptismalternativefrom: Date,
            dt_baptismalternativeto: Date,
            ds_baptismlocation: String
        },
        birth: {
            dt_birth: Date,
            dt_birthalternativefrom: Date,
            dt_birthalternativeto: Date,
            dt_birthlocation: String,
        },
        marriage: {
            dt_marriage: Date,
            dt_marriageIternativefrom: Date,
            dt_marriagealternativeto: Date,
            ds_marriagelocation: String
        },
        immigration: {
            dt_immigration: Date,
            dt_immigrationalternativefrom: Date,
            dt_immigrationalternativeto: Date,
            dt_immigrationlocation: String,
        },
        death: {
            dt_death: Date,
            dt_deathalternativefrom: Date,
            dt_deathalternativeto: Date,
            ds_deathlocation: String
        },
    },
    ds_comments : String,
    tp_ordervisibility: {
        type: Boolean,  //false is Public and true is Private
        default: false
    },
    allowUsers: [
        {type: String}
    ],
    tp_order : {
        type: Boolean,  //false is created and true is imported
        default: false
    },
    tp_orderexperience: {
        type: String,
        enum: ['Beginner', 'Specialist', 'Assessor']
    },
    nm_countrycurrency: {
        type:String,
    },
    ic_filesreviewed: Boolean,
    ic_orderactive: Boolean,
    ic_orderpayed: Boolean,
    ic_ordercanceled: Boolean,
    ic_ordernegotiated: Boolean,
    ic_ordercompleted: Boolean,
    qt_bids: Boolean,
    ic_review: {
        type:Boolean,    //false - no review true - review exists
        default: false
    },
    review:{
        qt_rating: Number,
        ds_title: String,
        dt_reviewed: String,
        ds_content: String
    },
    cd_statusflag:{
        type: Number,   //
        enum: [0,1,2],
        default: 0
    },
    cd_orderstatus: {
        type: Number,   //  0 - Em aberto, 1 - Em andamento, 2 - Concluido, 3- Cancelado
        enum: [0,1,2,3],
        default: 0
    },
    dt_releasemoney: {
        type: Date
    },
    vl_budget:{
        type: Number
    },
    vl_releasedbudget:{
        type: Number
    },
    bids: [{ 
        id_bids: Number,
        id_researcher: {type: Schema.Types.ObjectId, ref: "users"},
        dt_bid: Date,
        nr_deadline: Number,
        vl_researchrbid: Number,
        ds_bidcomments: String,
        negotiation: {
            id_negotiation: Number,
            id_customerfrom : {type: Schema.Types.ObjectId, ref : "users"},
            id_customerto: {type: Schema.Types.ObjectId, ref: "users"},
            nr_bidorder: Number,
            dt_startnegotiation: Date,
            dt_endnegotiation: Date,
            vl_negotiation: Date,
            ic_negotiationdenied: Boolean
        },
        ic_bidaccepted: Boolean,
        ic_bidrejected: Boolean,
        ic_negotiationaccepted: Boolean,
        ic_bidnegotiated: Boolean,
        ic_bidcanceled: Boolean
    }],
    shipping: {
        cd_tracking: String,
        address_origin: {
            nm_street: String,
            ds_streetcomplement: String,
            nm_state: String,
            nm_city: String,
            nm_county: String,
            cd_zip: String
        },
        address_delivery: {
            nm_street: String,
            ds_streetcomplement: String,
            nm_state: String,
            nm_city: String,
            nm_county: String,
            cd_zip: String
        }
    },
    order_cancellation: {
        id_ordercancellationtype: {type: Schema.Types.ObjectId, ref : ""},
        dt_ordercancellation: Date,
        ds_cancellationcomments: String,
    },
    event: [
        {
            nm_event: String,
            nm_status: {
                type: String,
                default: ''
            },
            nm_title: String,
            dt_event: Date,
            ds_content: String,
            ic_researcherupdate:{
                type: Boolean
            },
            ic_firstevent: {
                type: Boolean,
                default: false
            },
            ic_canconfirmed: {
                type: Boolean,
                default: false
            },
            ic_confirmed: {
                type: Boolean,
                default: false
            }
        }
    ],
    dt_lastupdatedevent: {
        type: Date
    }
}, {timestamps: true});

module.exports = mongoose.model("orders", order_schema);