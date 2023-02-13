import { useState, useEffect, useRef } from "react";
import cn from "classnames";
import { Typography, Box } from "@mui/material";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { useAtom, useAtomValue } from "jotai";
import {
  pendingPhishersAtom,
  pendingNotPhishersAtom,
} from "../atoms/phisherAtom";

import { invitationAtom } from "../atoms/invitationAtom";

import { reportTypes } from "../constants";
import statusText from "../statusText";

import LazyConnect from "./LazyConnect";
import Button from "../components/Button";
import TableList from "../components/TableList";
import SubmitBatchButton from "../components/SubmitBatchButton";

import LATEST_BLOCK_GRAPHQL from "../queries/latestBlock";
import IS_PHISHER_GRAPHQL from "../queries/isPhisher";
import { gql, useQuery } from "@apollo/client";
import useLazyQuery from "../hooks/useLazyQuery";
import { checkPhisherStatus, reportHandle } from "../checkPhisherStatus";

const config = require("../config.json");
const { chainId, address } = config;

function PendingReports() {
  const [active, setActive] = useState("ReportPhisher");
  const [storedPhishers, setStoredPhishers] = useAtom(pendingPhishersAtom);
  const invitation = useAtomValue(invitationAtom);
  const [storedNotPhishers, setStoredNotPhishers] = useAtom(
    pendingNotPhishersAtom
  );
  const [tabList, setTabList] = useState([]);
  const [selectedOption, setSelectedOption] = useState("TWT");

  const inputRef = useRef();

  // Get latest block
  const LATEST_BLOCK_GQL = gql(LATEST_BLOCK_GRAPHQL);
  const latestBlock = useLazyQuery(LATEST_BLOCK_GQL, {
    fetchPolicy: "no-cache",
  });

  // Check if isPhisher
  const IS_PHISHER_GQL = gql(IS_PHISHER_GRAPHQL);
  const isPhisher = useLazyQuery(IS_PHISHER_GQL, {
    variables: {
      contractAddress: address,
    },
  });

  useEffect(() => {
    setTabList(active === "ReportPhisher" ? storedPhishers : storedNotPhishers);
  }, [active, storedPhishers, storedNotPhishers]);

  const tableHeader = [
    {
      key: "name",
      title: "Name",
    },
    {
      key: "type",
      title: "Type",
    },
    {
      key: "status",
      title: "Status",
      render: (val) => statusText[val],
    },
    {
      key: "action",
      title: "Action",
      render: (val, row) => (
        <Button
          {...{
            label: "remove",
            active: false,
            onClick: () => removeClick(row),
          }}
        />
      ),
    },
  ];

  const removeClick = (row) => {
    if (active === "ReportPhisher") {
      removeStoredPhishers(row);
    } else {
      removeStoredNotPhishers(row);
    }
  };

  const removeStoredPhishers = (phisher) => {
    const newStoredPhishers = storedPhishers.filter(
      (item) => item.name !== phisher.name
    );
    setStoredPhishers(newStoredPhishers);
  };
  const removeStoredNotPhishers = (phisher) => {
    const newStoredNotPhishers = storedNotPhishers.filter(
      (item) => item.name !== phisher.name
    );
    setStoredNotPhishers(newStoredNotPhishers);
  };

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const checkInfo = async () => {
    if (!inputRef.current.value) return;
    const result = await checkPhisherStatus(
      selectedOption,
      inputRef.current.value,
      latestBlock,
      isPhisher
    );
    if (result) {
      reportHandle({
        phisher: inputRef.current.value,
        store: active === "ReportPhisher" ? storedPhishers : storedNotPhishers,
        setStore:
          active === "ReportPhisher" ? setStoredPhishers : setStoredNotPhishers,
        reportTypes,
        selectedOption,
      });
      inputRef.current.value = "";
    } else {
      console.error(result);
    }
  };

  const keyDown = (event) => {
    if (event.keyCode === 13) {
      checkInfo();
    }
  };

  return (
    <Box paddingTop="77px">
      <Typography component="h3" fontSize="20px" marginBottom="24px">
        Pending reports
      </Typography>
      <Typography component="p" marginBottom="22px">
        <Button
          {...{
            label: "Report Phisher",
            active: active === "ReportPhisher",
            className: "mr-[8px]",
            onClick: () => setActive("ReportPhisher"),
          }}
        />
        <Button
          {...{
            label: "Report not Phisher",
            active: active === "ReportNotPhisher",
            onClick: () => setActive("ReportNotPhisher"),
          }}
        />
      </Typography>

      <Box border="1px solid #D0D5DD" borderRadius="10px" padding="32px">
        <TableList {...{ tableHeader, tabList }} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginBottom="20px"
          marginTop="40px">
          <FormControl>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              style={{ width: "150px", height: "54px", borderRadius: "100px" }}
              id="demo-simple-select"
              value={selectedOption}
              label="Type"
              onChange={handleChange}>
              {reportTypes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            display="flex"
            justifyContent="flex-start"
            boxSizing="border-box"
            width="347px"
            height="54px"
            borderRadius="100px"
            padding="5px"
            marginLeft="16px"
            border="1px solid #D0D5DD">
            <Typography
              component="input"
              width="100%"
              height="100%"
              display="block"
              borderRadius="100px"
              paddingLeft="10px"
              onKeyDown={keyDown}
              style={{ outline: "none", border: "0" }}
              ref={inputRef}
              placeholder="Enter new names.."
            />
            <Button
              width="81px"
              height="100%"
              margin="auto"
              color="white"
              flexShrink="0"
              borderRadius="100px"
              label="Enter"
              style={{
                background: "linear-gradient(90deg, #334FB8 0%, #1D81BE 100%)",
              }}
              onClick={checkInfo}
            />
          </Box>
        </Box>
        <LazyConnect
          actionName="submit reports directly to the blockchain.Get a web3 compatible wallet(like metamask) to proceed."
          chainId={chainId}
          opts={{ needsAccountConnected: true }}>
          <SubmitBatchButton
            type={active}
            subData={
              active === "ReportPhisher" ? storedPhishers : storedNotPhishers
            }
            invitation={invitation}
            setLocalData={
              active === "ReportPhisher"
                ? setStoredPhishers
                : setStoredNotPhishers
            }
          />
        </LazyConnect>
      </Box>
    </Box>
  );
}

export default PendingReports;
