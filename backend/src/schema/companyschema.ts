import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  products: {
    type: Map,
    of: {
      userwalletAddress: { type: String, required: true },
      CommissionAddress: { type: String, required: true },

      imageUrl: { type: String, required: true },
      productUrl: { type: String, required: true },

      
      userwalletUniqueId: { type: String, required: true },
      commissionUniqueId: { type: String, required: true },

      userpolicyId:{type:String,required:true},
      commissionpolicyId:{type:String,required:true},

      userReward:{type:Number,required:true},
      websiteCommission:{type:Number,required:true},
    },
  },
});

const Company = mongoose.model('Company', companySchema);

export default Company;