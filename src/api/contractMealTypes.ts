const API = "/Config/api/contracts/meal_types";



export const getContractMealTypes = async (contractId: number) => {
    const res = await fetch(`${API}/list.php?contract_id=${contractId}`);
    return res.json();
};

export const updateContractMealType = async (payload: {
    contract_id: number;
    client_meal_type_id: number;
    cutoff_time: string;
    cutoff_days_offset: number;
    is_active: number;
    copy_from_client_meal_type_id: number | null;
}) => {
    const res = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    return res.json();
};
