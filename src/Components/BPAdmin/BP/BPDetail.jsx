import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Axios from '../../../Utils/Axios';
import axios from 'axios';
import AppSpinner from '../../../Utils/AppSpinner';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ToastContainer, toast } from 'react-toastify';
import SaveTabs from './SaveTabs';
import { RadioButton } from 'primereact/radiobutton';


const BPDetail = () => {
    const { bpId } = useParams();
    const [businessPartner, setBusinessPartner] = useState();
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [icon, setIcon] = useState('pencil');
    const [bpName, setBpName] = useState();
    const [system, setSystem] = useState('TEST');
    const [bpDescription, setBpDescription] = useState();
    const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;
    const ref = useRef(null);


    const getBPInfo = async (bpId) => {
        let url = `${resource}/groups/${bpId}`;
        const response = await Axios(url, 'GET', null, localStorage.getItem("auth_access_token"), false, false);
        if (!axios.isAxiosError(response)) {
            return response;
        } else {
            console.error("Error while retirving group information", response?.cause?.message);
        }
    }

    const getBP = async () => {
        const result = await getBPInfo(bpId);
        setIsReadOnly(true);
        setIcon('pencil');
        setBusinessPartner(result);
        setBpName(result?.name);
        setBpDescription(result?.description)
    }

    const handleEditClick = () => {
        if (isReadOnly) {
            setIsReadOnly(false);
            setIcon("save")
        } else {
            setIsReadOnly(true);
            setIcon("pencil")
        }
        handleBPSave(icon);
        if (ref.current) {
            ref.current.focus();
        }
    }

    const handleBPSave = async (currentIcon) => {
        if (currentIcon === "save" && isValidateChanges() === true) {
            const result = await updateBP(bpId);
            setBpName(result?.name);
            setBpDescription(result?.description);
            setBusinessPartner(result);
            toast.success(`${businessPartner?.name} has been updated`, { theme: "colored" })
        } else {
            setBpName(businessPartner?.name);
            setBpDescription(businessPartner?.description);
        }
    }

    const isValidateChanges = () => {

        if ((typeof validateBPName() === "boolean" && validateBPName() === true) || (typeof validateBPDescription() === "boolean" && validateBPDescription() === true)) {
            return true;
        } else {
            if ((typeof validateBPName() === 'string')) {
                toast.error(`Validation : ${validateBPName()}`, { theme: "colored" })
            } else if (typeof validateBPDescription() === "string") {
                toast.error(`Validation : ${validateBPDescription()}`, { theme: "colored" })
            } else {
                return false;
            }
        }
    }

    const validateBPName = () => {
        if (businessPartner?.name === bpName) {
            return false;
        } if (!bpName || !String(bpName).includes("BP_") || String(bpName).length !== 13 || String(bpName).substring(3).length !== 10) {
            return "BP_ID starts with BP_ and it should contains 10 digits of numbers except BP_";
        }

        return true;
    }

    const validateBPDescription = () => {
        if (businessPartner?.description === bpDescription) {
            return false;
        } if (!bpDescription || String(bpDescription).length < 5) {
            return "BP_Name must contains more than 5 characters";
        }
        return true;
    }


    const updateBP = async (bpId) => {
        let url = `${resource}/groups/${bpId}`;
        const body = {
            "name": bpName,
            "description": bpDescription
        };
        const response = await Axios(url, 'PUT', body, localStorage.getItem("auth_access_token"), false, false);
        if (!axios.isAxiosError(response)) {
            // console.log("response ***", response);
            return response;
        } else {
            console.error("Error while updating current group ::", response?.cause?.message);
        }
    }

    const handleOnChange = (field, value) => {
        switch (field) {
            case "name":
                setBpName(value);
                break;
            case "desc":
                setBpDescription(value);
                break;
            default:
                console.log("no field matches");
        }
    }


    useEffect(() => {
        getBP()
    }, [])


    return (
        <>
            <div
                className="d-flex align-items-center pt-2 pb-2 container profileHeader"
                style={{
                    backgroundColor: "#e5e5e5",
                    height: "200px !important",
                }}
            >
                <div className='d-flex  align-items-center w-100'>
                    <div style={{ width: "70px", marginLeft: "15px" }}>
                        <div style={{
                            border: "1px solid",
                            height: "70px",
                            width: "70px",
                            padding: "20px",
                            borderRadius: "30px",
                            backgroundColor: "#1A9E86",
                            color: "#ffff"
                        }}>
                            <h4>BP</h4>
                        </div>
                    </div>

                    {isReadOnly &&
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexDirection: "column",
                            justifyContent: 'flex-start',
                            marginLeft: "10px"
                        }}>
                            <h2 className="fw-normal">{businessPartner?.name}</h2>
                            <h5 className="fw-light text-secondary ">{businessPartner?.description}</h5>
                        </div>
                    }
                    {!isReadOnly &&
                        <div>
                            <InputText width="300px !important" style={{ marginBottom: "7px", marginLeft: "10px" }} type="text" className="p-inputtext-lg" placeholder="BP ID" value={bpName} ref={ref} onChange={(e) => handleOnChange("name", e.target.value)} />
                            <InputText width="350px !important" style={{ marginBottom: "7px", marginLeft: "10px" }} type="text" className="p-inputtext-lg" placeholder="BP Name" value={bpDescription} ref={ref} onChange={(e) => handleOnChange("desc", e.target.value)} />
                        </div>
                    }
                    <Button size='small' icon={`pi pi-${icon}`} onClick={(e) => handleEditClick()} style={{ borderRadius: "15px", border: "none", background: "black", marginLeft: "20px" }} />
                </div>
                <div style={{ marginBottom: "50px", padding: "10px" }}>
                    <div className="d-flex justify-content-end" style={{ width: "250px" }}>
                        <div style={{ marginRight: "25px" }}>
                            <label htmlFor="system" style={{ fontSize: "20px", fontWeight: "bolder" }}>SYSTEM</label>
                        </div>
                        <div className='d-flex flex-column' >
                            <div className='d-flex'>
                                <RadioButton inputId="PROD" name="PROD" value='PROD' />
                                <label htmlFor="PROD" style={{ marginLeft: "10px", fontWeight: "bolder", fontSize: "17px" }} className="ml-2">PROD</label>
                            </div>
                            <div className='d-flex' style={{ marginTop: "5px" }}>
                                <RadioButton inputId="TEST" name="TEST" value='TEST' />
                                <label htmlFor="TEST" style={{ marginLeft: "10px", fontWeight: "bolder", fontSize: "17px" }} className="ml-2">TEST</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <SaveTabs />
                    </div>
                </div>
            </div>
            {/* <AppSpinner /> */}
            <ToastContainer />
        </>
    )
}

export default BPDetail
