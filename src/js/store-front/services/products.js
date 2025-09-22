import apiClient from './api';

export const getProducts = async () => {
  const response = await apiClient.get('products');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await apiClient.get(`products/${id}`);
  return response.data;
};



/**
 * Expected API Response Structure
  {
    "id": 1,
    "name": "Product Name",
    "price": "199.99",
    "original_price": "249.99",
    "short_description": "Brief description",
    "description": "<p>Full HTML description</p>",
    "images": ["url1", "url2", "url3"],
    "average_rating": 4.5,
    "reviews_count": 247,
    "variations": {
      "color": {
        "label": "Color",
        "type": "color",
        "options": [
          {"value": "black", "label": "Black", "color": "#000000"},
          {"value": "white", "label": "White", "color": "#ffffff"}
        ]
      }
    },
    "features": ["Feature 1", "Feature 2"],
    "specifications": {
      "Driver Size": "40mm Dynamic",
      "Frequency Response": "20Hz - 20kHz"
    }
  }
 */