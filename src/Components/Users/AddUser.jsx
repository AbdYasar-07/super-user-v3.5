import React, { useEffect, useState } from "react";
import Axios from "../../Utils/Axios";
import "../Styles/AddUser.css";
import { FaUser } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addConceptionDatabase,
  renderingCurrentUser,
} from "../../store/auth0Slice";
import PasswordValidation from "../../Utils/PasswordValidation";
import { useNavigate } from "react-router-dom";

function AddUser({
  setIsUserAdded,
  isTokenFetched,
  setIsPasteModelShow,
  isPasteCancel,
  setIsPasteCancel,
  buttonLabel,
}) {
  const userInfo = useSelector((store) => store.auth0Context);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [listOfConnnection, setlistOfConnnection] = useState([]);
  // const [databaseConnection, setDatabaseConnection] = useState("");
  // const [userNameValidation, setUserNameValidation] = useState(false);
  const [emailReqdValidation, setEmailReqdValidation] = useState(false);
  const [validation, setValidation] = useState(false);
  const [emailValidation, setEmailValidation] = useState(false);
  const [isConnection, setIsConnection] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(false);
  const [passwordCapableValidation, setPasswordCapableValidation] =
    useState(false);
  const [isPassWordValue, setIsPasswordValue] = useState(false);
  const [repeatPasswordValidation, setRepeatPasswordValidation] =
    useState(false);
  const [userModal, setUserModal] = useState(false);
  const [isModelView, setIsModelView] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const initializeFileds = () => {
    setIsDisable(false);
    setIsConnection(false);
    setUserModal(true);
    setValidation(false);
    setEmailReqdValidation(false);
    setEmailValidation(false);
    setPasswordValidation(false);
    setPasswordCapableValidation(false);
    setRepeatPasswordValidation(false);
    setIsPasswordValue(false);
    setUserEmail("");
    setUserPassword("");
    setRepeatPassword("");
    if (userInfo?.accessToken && userInfo?.accessToken?.length > 0) {
      setIsModelView(true);
    }
  };

  const getAuthToken = async () => {
    let body = {
      client_id: process.env.REACT_APP_AUTH_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.REACT_APP_AUTH_MANAGEMENT_CLIENT_SECRET,
      audience: process.env.REACT_APP_AUTH_MANAGEMENT_AUDIENCE,
      grant_type: process.env.REACT_APP_AUTH_GRANT_TYPE,
    };
    return await Axios(
      "https://dev-34chvqyi4i2beker.jp.auth0.com/oauth/token",
      "POST",
      body,
      null
    )
      .then(async (managementToken) => {
        return managementToken;
      })
      .catch((error) => {
        return `Error ::", ${error}`;
      });
  };
  const getDatabaseConnections = async () => {
    if (userInfo?.accessToken && userInfo?.accessToken?.length > 0) {
      await getAuthToken()
        .then(async (managementToken) => {
          await Axios(
            "https://dev-34chvqyi4i2beker.jp.auth0.com/api/v2/connections?strategy=auth0",
            "GET",
            null,
            managementToken?.access_token
          )
            .then((databaseNames) => {
              setlistOfConnnection(databaseNames);
              // setDatabaseConnection(filterDatabase("conception"));
              dispatch(
                addConceptionDatabase({
                  conception: databaseNames.filter(
                    (db) => db.name === "conception"
                  ),
                })
              );
            })
            .catch((error) => {
              console.error("Error while fetching Auth0 Databases ::", error);
            });
        })
        .catch((error) => {
          console.error("Error while fetching mangement token :::", error);
        });
    }
  };

  const createUser = async () => {
    // check whether the access_token is valid or not
    if (userInfo?.accessToken && userInfo?.accessToken?.length > 0) {
      await getAuthToken().then(async (managementToken) => {
        let body = {
          email: userEmail,
          connection: userInfo.conceptionDatabase[0]?.name,
          password: userPassword,
        };
        await Axios(
          "https://dev-34chvqyi4i2beker.jp.auth0.com/api/v2/users",
          "POST",
          JSON.stringify(body),
          managementToken?.access_token,
          true
        )
          .then((addedUser) => {
            if (addedUser.hasOwnProperty("response")) {
              toast(addedUser.response.data.message, { type: "error" });
              setIsDisable(false);
              return;
            }
            dispatch(renderingCurrentUser({ currentUser: addedUser }));
            navigate(`/members/${addedUser?.user_id}/roles/assigned`);
            toast(`${addedUser.name} is added`, {
              type: "success",
              theme: "colored",
            });
            setUserModal(false);
            setIsUserAdded(true);
          })
          .catch((error) => {
            if (JSON.stringify(error) !== "{}") {
              toast(error.response.data.message, { type: "error" });
              setIsDisable(false);
            }
          });
      });
    }
  };
  const isemailvalidate = () => {
    let emailValidation =
      /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    !emailValidation ? setEmailValidation(true) : setEmailValidation(false);
    if (!userEmail.trim()) {
      setEmailReqdValidation(true);
      // setValidation(true);
    }
  };

  const isPassWordValidate = () => {
    setIsPasswordValue(true);
    let passwordValidate =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,}$/.test(
        userPassword
      );
    !passwordValidate
      ? setPasswordCapableValidation(true)
      : setPasswordCapableValidation(false);
  };
  // const isConnectionValidate = () => {
  //   databaseConnection.length === 1
  //     ? setIsConnection(true)
  //     : setIsConnection(false);
  // };

  const comparePassword = () => {
    setRepeatPasswordValidation(true);
    userPassword !== repeatPassword
      ? setPasswordValidation(true)
      : setPasswordValidation(false);
  };

  const getUserData = () => {
    setValidation(true);
    setEmailReqdValidation(true);
    setIsPasswordValue(true);
    setRepeatPasswordValidation(true);

    if (
      !(
        repeatPasswordValidation &&
        isPassWordValue &&
        passwordCapableValidation &&
        emailValidation &&
        passwordValidation &&
        userInfo.conceptionDatabase.length !== 0
      ) &&
      userEmail.length !== 0 &&
      userPassword.length !== 0 &&
      userInfo.conceptionDatabase.length !== 0
    ) {
      createUser();
      setIsUserAdded(false);
      setIsDisable(true);
    }
  };
  const toggleButton = () => {
    setUserModal(false);
  };

  // const filterDatabase = (filteredDbname) => {
  //   const result = listOfConnnection.filter((db) => {
  //     return db.name === filteredDbname;
  //   });
  //   return result;
  // };

  useEffect(() => {
    const init = () => {
      getDatabaseConnections();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.accessToken]);
  useEffect(() => {
    if (isPasteCancel) {
      setIsModelView(true);
      setUserModal(true);
      setIsPasteModelShow(false);
      setIsPasteCancel(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPasteCancel]);
  return (
    <div className={`${!userInfo?.accessToken ? "cursorDisable" : ""}`}>
      <ToastContainer />
      <button
        type="button"
        class="btn btn-primary"
        disabled={!userInfo?.accessToken}
        onClick={() => initializeFileds()}
      >
        + Create {buttonLabel}'(s)
      </button>
      {isModelView && userModal && (
        <div
          className="customModal transitionEffect "
          style={{ zIndex: "1000" }}
        >
          <div className="col-4 m-auto bg-white py-2 px-3">
            <div class="modal-content container col-5 overflow-hidden">
              <div class="modal-header  mb-3 pt-2">
                <h1 class="modal-title fs-5" id="exampleModalLabel">
                  Create {buttonLabel}{" "}
                  <FaUser style={{ marginBottom: "4px" }} />
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  onClick={() => toggleButton()}
                ></button>
              </div>
              <div class="modal-body">
                <form class="row g-2 needs-validation">
                  <div class="mb-3 text-start">
                    <label for="recipient-name" class="col-form-label">
                      Login (email address)
                      <span className="text-danger ps-1">*</span>
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      style={{ padding: "12px", border: "solid 1px #adadad90" }}
                      id="userEmail"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      onBlur={isemailvalidate}
                    />
                    {emailReqdValidation && !userEmail && (
                      <p className="text-danger mt-1 mb-0">
                        Email is required *
                      </p>
                    )}
                    {userEmail && emailValidation && (
                      <p className="text-danger mt-1 mb-0">
                        Enter valid e-mail *
                      </p>
                    )}
                  </div>

                  <div class="mb-3 text-start">
                    <label for="recipient-name" class="col-form-label">
                      Password<span className="text-danger ps-1">*</span>
                    </label>
                    <PasswordValidation
                      password={userPassword}
                      setUserPassword={setUserPassword}
                      onBlurFunc={isPassWordValidate}
                    />
                    {isPassWordValue && !userPassword && (
                      <p className="text-danger mt-1 mb-0">
                        Password is required
                      </p>
                    )}
                    {userPassword &&
                      passwordCapableValidation &&
                      isPassWordValue && (
                        <p className="text-danger">
                          Password should have atleast 8 characters and special
                          characters
                        </p>
                      )}
                  </div>
                  <div class="mb-3 text-start">
                    <label for="recipient-name" class="col-form-label">
                      Repeat Password<span className="text-danger ps-1">*</span>
                    </label>
                    <PasswordValidation
                      password={repeatPassword}
                      setUserPassword={setRepeatPassword}
                      onBlurFunc={comparePassword}
                    />
                    {repeatPasswordValidation && !repeatPassword && (
                      <p className="text-danger mt-1 mb-0">
                        Repeated Password is required
                      </p>
                    )}
                    {repeatPassword && passwordValidation && (
                      <p className="text-danger">
                        Repeat password should be same as password
                      </p>
                    )}
                  </div>
                  <div>
                    <label for="conection" className="pe-4 d-block text-start">
                      Connection <span className="text-danger ms-2">*</span>
                    </label>
                    <select
                      style={{ padding: "12px", border: "solid 1px #adadad90" }}
                      className="w-100 form-control"
                      // onChange={(e) => {
                      //   setDatabaseConnection(e.target.value);
                      // }}
                      disabled={
                        userInfo.conceptionDatabase?.length === 1 ? true : false
                      }
                      // onBlur={isConnectionValidate}
                    >
                      <option value={userInfo.conceptionDatabase}>
                        Concepcion
                      </option>
                      {/* {listOfConnnection.length > 0 &&
                        listOfConnnection?.map((dataBase, index) => {
                          return (
                            <option value={dataBase.name} key={index}>
                              {dataBase.name}
                            </option>
                          );
                        })} */}
                      {listOfConnnection.length === 0 && (
                        <option value={""}>No database found</option>
                      )}
                    </select>
                    {validation &&
                      isConnection &&
                      userInfo.conceptionDatabase.length !== 1 && (
                        <p className="text-start text-danger">
                          Connection is required
                        </p>
                      )}
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary m-2 mt-3"
                  onClick={toggleButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary m-2  mt-3"
                  onClick={() => getUserData()}
                  disabled={isDisable}
                >
                  Create
                </button>
                <button
                  type="submit"
                  class="btn btn-primary m-2  mt-3"
                  onClick={() => {
                    setUserModal(false);
                    setIsPasteModelShow(true);
                  }}
                >
                  Create {buttonLabel}s
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddUser;
