import React, { useState, useEffect } from "react";
import Search from "../../../Utils/Search";
import { useNavigate } from "react-router-dom";
import DataGridTable from "../../../Utils/DataGridTable";
import Axios from "../../../Utils/Axios";
import {
  addManagementAccessToken,
  renderingCurrentUser,
} from "../../../store/auth0Slice";
import { useDispatch, useSelector } from "react-redux";
import AppSpinner from "../../../Utils/AppSpinner";

const MemberTable = () => {
  const [filterRecord, setFilteredRecord] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoad] = useState(false);
  const [memberData, setMemberData] = useState([]);
  const [actualMembers, setActualMembers] = useState([]);

  const [serverPaginate, setServerPagnitae] = useState({
    start: 0,
    length: 0,
    total: -1,
    processedRecords: 0,
    users: [],
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth0Context = useSelector((state) => state.auth0Context);
  const resource = process.env.REACT_APP_AUTH_MANAGEMENT_AUDIENCE;
  const endpoint = process.env.REACT_APP_MANAGEMENT_API;

  const getCurrentData = (currentData) => {
    const filteredRecord = actualMembers.filter((member) => {
      return member.user_id === currentData.id;
    });
    dispatch(renderingCurrentUser({ currentUser: filteredRecord[0] }));
    navigate(`/members/${currentData.id}/roles/assigned`);
  };

  useEffect(() => {
    getMembersList();
  }, []);

  const fetchManagementToken = async () => {
    const body = {
      grant_type: process.env.REACT_APP_AUTH_GRANT_TYPE,
      client_id: process.env.REACT_APP_M2M_CLIENT_ID,
      client_secret: process.env.REACT_APP_M2M_CLIENT_SECRET,
      audience: process.env.REACT_APP_AUDIENCE,
    };
    return await Axios(endpoint, "POST", body, null, true).then((response) => {
      dispatch(
        addManagementAccessToken({
          managementAccessToken: response.access_token,
        })
      );
      return response;
    });
  };

  const getMembersList = async () => {
    setLoad(true);
    const managementResponse = await fetchManagementToken();
    let response = await fetchAuth0Users(
      100,
      "conception",
      managementResponse.access_token,
      serverPaginate
    );
    filterUsersByDatabase(response.users, "conception");
    setLoad(false);
  };

  const filterUsersByDatabase = (users, databaseName) => {
    if (users.length === 0) return;

    // criteria 1 : filter for Conception database
    const filteredByConceptionDatabase = users.filter((user) => {
      if (hasSingleIdentityWithConnectionName(user, databaseName)) return user;
    });

    // criteria 2 : filter for BP_
    const filteredUsers = filteredByConceptionDatabase.filter((user) =>
      user?.app_metadata?.authorization?.groups?.some((group) =>
        group.startsWith("BP_")
      )
    );

    if (Array.isArray(filteredUsers)) {
      setActualMembers(filteredUsers);
      const members = filteredUsers.map((filteredUser) => {
        let indexOfBpGroup = -1;
        filteredUser?.app_metadata?.authorization?.groups?.forEach(
          (group, index) => {
            if (String(group).startsWith("BP_")) {
              indexOfBpGroup = index;
            }
          }
        );
        return {
          id: filteredUser.user_id,
          Name: filteredUser.name,
          Email: filteredUser.email,
          LastLogin: formatTimestamp(filteredUser.last_login),
          Logins: filteredUser.logins_count,
          Connections:
            filteredUser.identities[filteredUser.identities.length - 1]
              .connection,
          BP: filteredUser?.app_metadata?.authorization?.groups[indexOfBpGroup],
        };
      });

      setFilteredRecord(members);
      setMemberData(members);
    }
  };

  function hasSingleIdentityWithConnectionName(user, connectionName) {
    if (
      user &&
      user.identities &&
      Array.isArray(user.identities) &&
      user.identities.length === 1
    ) {
      return user.identities[0].connection === connectionName;
    }

    return false;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "Never";
    }
    const date = new Date(timestamp);
    const now = new Date();

    const diffInMilliseconds = Math.abs(now - date);
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  /**
   * @description : It is an recursive function so pass the argument properly
   * @author Abdul Yashar
   */
  const fetchAuth0Users = async (
    perPage,
    database,
    managementAccessToken,
    serverPaginate
  ) => {
    if (serverPaginate.processedRecords === serverPaginate.total) {
      return serverPaginate;
    }

    let url = `${resource}users?per_page=${perPage}&include_totals=true&connection=${database}&search_engine=v3&page=${serverPaginate.start}`;
    const response = await Axios(
      url,
      "get",
      null,
      managementAccessToken,
      false
    );
    const updatedServerPaginate = {
      start: serverPaginate.start + 1,
      length: response.length,
      total: response.total,
      processedRecords: serverPaginate.processedRecords + response.length,
      users: [...serverPaginate?.users, ...response?.users],
    };
    setServerPagnitae(updatedServerPaginate);
    return await fetchAuth0Users(
      perPage,
      database,
      managementAccessToken,
      updatedServerPaginate
    );
  };

  return (
    <>
      <div className="py-4">
        <Search
          records={memberData}
          setRecords={setFilteredRecord}
          isSearchActived={setIsSearchActive}
          setLoadSpinner={setLoad}
          data={memberData}
        />
      </div>
      {!loading && (
        <DataGridTable
          data={filterRecord}
          rowHeader={[
            "Name",
            "Email",
            "Last Login",
            "Logins",
            "Connections",
            "BP",
          ]}
          getCurrentData={getCurrentData}
          loading={loading}
        />
      )}
      {loading && <AppSpinner />}
    </>
  );
};
export default MemberTable;

// const dummmyData = [
//   {
//     id: "1000",
//     Name: "jeeva",
//     Email: "jeeva@gmail.com",
//     LastLogin: "nethu",
//     Logins: "today",
//     Connections: "conception",
//     BP: "conception",
//   },
// ];
