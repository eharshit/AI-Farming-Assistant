import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const predictCrop = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict/crop`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Network error connecting to AI Server" };
    }
};

export const predictDisease = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE_URL}/predict/disease`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Network error connecting to AI Server" };
    }
};

export const predictFertilizer = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict/fertilizer`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Network error connecting to AI Server" };
    }
};

// --- Farm Management & Dashboard API ---

export const getFarmStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/farm/status`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Error fetching farm status" };
    }
};

export const updateFarmStatus = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/farm/status`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Error updating farm status" };
    }
};

export const resetFarmStatus = async () => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/farm/status`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Error resetting dashboard" };
    }
};

export const getRecommendationHistory = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/farm/recommendations`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: "Error fetching history" };
    }
};
