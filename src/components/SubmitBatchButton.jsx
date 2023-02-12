import cn from "classnames";
import Button from "./Button";
import reportMembers from "../reportMembers";
import reportPhishers from "../reportPhishers";
import { reportTypes } from "../constants";
import { toast } from "react-hot-toast";
const { ethers } = require("ethers");
function SubmitBatchButton(props) {
  const { type, provider, subData, invitation = false, setLocalData } = props;
  const ethersProvider = new ethers.providers.Web3Provider(provider, "any");

  const submitClick = () => {
    phishingReport(type === "ReportPhisher");
  };

  // const memberReport = async () => {
  //   if (!invitation) return;
  //   try {
  //     await reportMembers(subData, ethersProvider, invitation);
  //     setLocalData([]);
  //   } catch (err) {
  //     console.error(`Error: ${err.message}`);
  //   }
  // };

  const phishingReport = async (isReportPhisher) => {
    const loading = toast.loading("Waiting...");
    const data = subData.map((item) => {
      const name =
        item.name.indexOf("@") === 0 ? item.name.slice(1) : item.name;
      const type = reportTypes.find(
        (report) => report.label === item.type
      )?.value;
      return `${type}:${name.toLowerCase()}`;
    });
    try {
      const block = await reportPhishers(
        data,
        ethersProvider,
        invitation,
        isReportPhisher
      );
      await block.wait();
      document.dispatchEvent(new Event("clear_pendingPhishers"));
      setLocalData([]);
      toast.success("Batch submitted to blockchain!");
    } catch (err) {
      toast.error(err.reason || err.error.message);
    }
    toast.dismiss(loading);
  };

  return (
    <>
      {subData.length !== 0 && (
        <Button
          className="bg-gradient-to-r from-[#334FB8] to-[#1D81BE] text-white inline-block m-auto rounded-[100px]"
          label="Submit batch to blockchain"
          onClick={submitClick}
        />
      )}
    </>
  );
}

export default SubmitBatchButton;
