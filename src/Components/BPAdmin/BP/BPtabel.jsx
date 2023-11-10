import React, { useEffect, useState } from "react";
import Search from "../../../Utils/Search";
import DataGridTable from "../../../Utils/DataGridTable";
import AppSpinner from "../../../Utils/AppSpinner";
import Axios from "../../../Utils/Axios";
import { getOSCIDByBPCode, groupFilter } from "../../BusinessLogics/Logics";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const BPtabel = () => {
  const [loading, setLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [bpData, setBpData] = useState([]);
  const [filterRecord, setFilteredRecord] = useState([]);
  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;
  const auth0Context = useSelector((store) => store?.auth0Context);
  const navigate = useNavigate();

  const getCurrentData = (data) => {
    navigate(`/bp/${data.id}`);
  };

  const fetchAllGroups = async () => {
    try {
      const total_groups_response = await Axios(
        resource + "/groups",
        "GET",
        null,
        localStorage.getItem("auth_access_token"),
        false
      );
      const total_groups = await total_groups_response.groups;
      if (total_groups?.length > 0) {
        await bindGroupData(groupFilter(total_groups, "BP_"));
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const bindGroupData = async (total_groups) => {
    total_groups = total_groups.map((_grp) => {
      return {
        id: _grp?._id,
        Name: _grp?.name,
        Description: _grp?.description,
        Members: _grp?.members?.length,
        ShopifyID: "",
        OSCID: "",
      };
    });

    const bpCodes = total_groups.map((group) => {
      return String(group.Name).substring(3);
    });

    // call for osc
    await accessOSC(bpCodes, total_groups);
    // call for shopify

    if (total_groups?.length > 0) {
      setFilteredRecord(total_groups);
      setBpData(total_groups);
    }
  };

  const accessOSC = async (bpCodes, total_groups) => {
    if (Array.isArray(bpCodes) && bpCodes.length > 0) {
      const bpIdPromises = bpCodes.map(async (bpCode) => {
        const result = await getOSCIDByBPCode(bpCode);
        const idx = total_groups.findIndex(
          (group) => String(group.Name).substring(3) === bpCode
        );
        total_groups[idx]["OSCID"] =
          result && result?.rows?.length > 0 ? result?.rows[0][0] : "-";
      });
      await Promise.all(bpIdPromises);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllGroups();
  }, []);

  useEffect(() => {
    if (auth0Context?.refreshUnRelatedComponent?.target === "BPTABLE") {
      setLoading(true);
      fetchAllGroups();
    }
  }, [auth0Context?.refreshUnRelatedComponent?.render]);

  return (
    <>
      <div className="py-4">
        <Search
          records={bpData}
          setRecords={setFilteredRecord}
          isSearchActived={setIsSearchActive}
          setLoadSpinner={setLoading}
          data={bpData}
        />
      </div>
      {!loading && (
        <DataGridTable
          data={filterRecord}
          rowHeader={[
            "Name",
            "Description",
            "Members",
            "Shopify ID",
            "OSC ID",
            "Action",
          ]}
          getCurrentData={getCurrentData}
          loading={loading}
          action={true}
        />
      )}
      {loading && <AppSpinner />}
    </>
  );
};

export default BPtabel;
