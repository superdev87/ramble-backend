const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;
const userSchema = new mongoose.Schema(
  {
    accountaactive: Boolean,
    accountcanceled: Boolean,
    accountsuspended: Boolean,
    dt_lastlogin: Date,
    dt_birth: {
      type: Date,
      default: null,
    },
    cd_customer: String,
    cd_researcher: String,

    ds_email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Plase provide a valid email"],
    },
    ds_gender: {
      type: Number,
      default: 0,
      enum: [0, 1, 2], //0 male, 1 femaile, 2 not specific
    },
    ds_avatar: {
      // customer avatar
      type: String,
      default: "avatar1.png",
    },
    ds_avatar1: {
      // researcher avatar
      type: String,
      default: "avatar1.png",
    },
    ds_password: {
      type: String,
      minlength: 8,
      select: false,
    },
    ic_emailverified: {
      type: Boolean,
      default: false,
    },
    ic_profile: {
      type: Number, //0 is only customer and 1 is only researcher and 2 is both
      default: 0,
    },
    ic_researchertype: {
      type: Boolean, //true is individual and false is company
      default: true,
    },
    nm_user: {
      type: String,
      default: "",
    },
    ds_telephone: {
      type: String,
      default: "",
    },
    dt_registration: {
      type: Date,
      default: new Date(),
    },
    cd_country: {
      type: String,
      required: true,
    },
    nm_state: {
      type: String,
    },
    nm_city: {
      type: String,
    },
    nm_address: {
      type: String,
    },
    nm_number: {
      type: String,
    },
    nm_complement: {
      type: String,
    },
    cd_cep: {
      type: String,
    },
    qt_avgrating_customer: Number,
    qt_avgrating_researcher: Number,

    ic_getnewdailyorders: {
      type: Boolean,
      default: true,
    },
    ic_websitenews: {
      type: Boolean,
      default: true,
    },
    ic_whengetnewmessage: {
      type: Boolean,
      default: true,
    },
    ic_orderinvites: {
      type: Boolean,
      default: true,
    },
    ic_whenbidisaccepted: {
      type: Boolean,
      default: true,
    },
    ic_whengetnewbid: {
      type: Boolean,
      default: true,
    },
    ic_isunsubscribed: {
      type: Boolean,
      default: true,
    },
    ic_issuspended: {
      type: Boolean,
      default: false,
    },
    ic_securitymode: {
      type: Boolean,
      default: false,
    },
    nm_countrycurrency: {
      type: String,
      default: "Reais (BRL)",
    },
    account_cancellation: {
      id_accountcancellationtype: {
        type: Schema.Types.ObjectId,
        ref: "account_cancellation_types",
      },
      ds_accountcancelcomment: {
        type: String,
        default: "",
      },
    },
    nm_company: {
      type: String,
      default: "",
    },
    about_me: {
      ds_aboutme: {
        type: String,
        default: "",
      },
      languages: [
        {
          id_language: { type: Schema.Types.ObjectId, ref: "languages" },
          id_languageproficiency: {
            type: Schema.Types.ObjectId,
            ref: "language_proficiencies",
          },
        },
      ],
      specialities: [
        {
          type: Schema.Types.ObjectId,
          ref: "specialities",
        },
      ],
    },
    ic_currentplan: {
      type: Number,
      default: 0,
      enum: [0, 1, 2], //0 beginner, 1 Specialist, 2 Assessor
    },
    dt_signatureplan: {
      type: Date,
    },
    ds_paymentemail: {
      type: String,
    },
    vl_totalwithdrawn: {
      type: Number,
      default: 0,
    },
    vl_balanceinprogress: {
      type: Number,
      default: 0,
    },
    vl_withdrawal: {
      type: Number,
      default: 0,
    },
    dt_withdrawable: {
      type: Date,
    },
    ds_paymentmethod: {
      type: String,
      default: "MercadoPago",
    },
    dt_startplan: {
      type: Date,
    },
    dt_endplan: {
      type: Date,
    },

    ic_multiAutoPlay: {
      type: Boolean,
      default: false,
    },
    ic_backgroundMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  console.log(this.isModified("ds_password"));
  //Only run this function if password was modified
  if (!this.isModified("ds_password")) return next();

  //Hash the password with a cost of 10
  const salt = bcrypt.genSaltSync(10);
  this.ds_password = await bcrypt.hash(this.ds_password, salt);

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("users", userSchema);
