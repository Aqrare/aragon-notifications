import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// import * as sgMail from "@sendgrid/mail";
import {ethers} from "ethers";
import {
  getLogFromMoralis,
  sendEmail,
  getContractAddressList,
  getEmailList,
  getDaoName,
} from "../utils";

exports.scheduledFunction = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const result = await task();
    console.log(result);
    // if (result.isErr()) {
    //   console.error(result.error);
    //   return result.error;
    // }
    // return result.value;
  });

const provider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/b31925c3f00146d2a2a3b0c55986fbf3"
);

// TODO: Fix
// let executedAt = provider.getBlockNumber().toString();
let executedAt = "0";

const signature = "MembersAdded(address[])";
// const topic0 = ethers.utils.id(signature);
const topic0 = ethers.utils.solidityKeccak256(["string"], [signature]);
const eventName = "member_added";

const topics: string[] = [topic0];
const templateId = "d-f24c1e30aaa44203afce57f084c37e53";

const task = async () => {
  const contractAddressLists = await getContractAddressList();
  contractAddressLists.forEach(async (contractAddress: string) => {
    const logs = await getLogFromMoralis(
      contractAddress,
      topics[0],
      executedAt
    );
    console.log(logs);
    // if (logs) {
    const daoName = await getDaoName(contractAddress);
    const emails = await getEmailList(contractAddress, eventName);
    console.log("emails", emails);
    emails.forEach((email) => {
      sendEmail(daoName, email, templateId, contractAddress);
    });
    // } else {
    //   console.log("No events found");
    // }
  });
  executedAt = (await provider.getBlockNumber()).toString();
};

export const testtesttask = functions.https.onRequest(async (req, res) => {
  const contractAddressLists = await getContractAddressList();
  console.log("contractAddressLists", contractAddressLists);
  contractAddressLists.forEach(async (contractAddress: string) => {
    console.log("contractAddress", contractAddress);
    const logs = await getLogFromMoralis(
      contractAddress,
      topics[0],
      executedAt
    );
    console.log(logs);
    // if (logs) {
    const daoName = await getDaoName(contractAddress);
    console.log("daoName", daoName);
    const emails = await getEmailList(contractAddress, eventName);
    console.log("emails", emails);
    emails.forEach((email) => {
      console.log(email, "email");
      sendEmail(daoName, email, templateId, contractAddress);
    });
    // } else {
    //   console.log("No events found");
    // }
  });
  executedAt = (await provider.getBlockNumber()).toString();
});