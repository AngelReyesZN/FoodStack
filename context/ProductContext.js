import React, { createContext, useState } from 'react';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      nombre: 'Takis Fuego',
      precio: '$12.00',
      unidades: '15',
      categoria: 'Frituras',
      vendedor: 'Laura Chavero',
      imagen: 'https://s3-alpha-sig.figma.com/img/3cd1/b4de/14350db37ad601fbb0b5b9808377ee9e?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=fNhqSFEkMtVqBHY8pSaXkNM8kfxz7snBCNZWOT~a7HEPabvmY9VDec~Bw1PLmPnf89SrxENyhUKQs7KpGavaUS24qQ2Kttu4cGI3HG5TpYpItGlqCvWL8jNvttwLzMkUHlJhpHbpcFP-nfcgFUsn~yvzTDtmf3jbmwEVd24MGif7gKW4FXpcu1ySPcldeBFXH-00gzx1SWYt2ScptpqgXSaKl5B49CplHUDTr75XbUItujtHPu2mwUVYdMq593marmAkNFJ0H1TeDpXhGtEZqTKYUyrtpXL46tUAe0x~5IJeUBoXTifq43NmUTIVOzj-0sYZ4SUQjefJtGktL4nLPA__'
    },
    {
      id: 2,
      nombre: 'Electrolit',
      precio: '$18.00',
      unidades: '5',
      categoria: 'Bebidas',
      vendedor: 'Josafat Duarte',
      imagen: 'https://s3-alpha-sig.figma.com/img/1349/a105/289ad23e915324c72475629424d15f85?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=EvdC9qcnX4qWMLZRZiD0JwpF3Anw-CmIFvTECW47eiH~-ScyuYmuKa3f1cqjsQBJ5cgGVPCZn-xCYh2hBve8YpncKLypicYRLshpzAOeTNB04Pa3L-sKXF7l~boShp8hqJsybzdu49c7frBLmanCUHKv3Hjx5Umc7HMRlRDJjmobO3gbtfwuxfA5~yMD2BubL3tA0NsoM~A4Q9a-6ft1YyKp37QHowAaLInKMKsnb0x6-7MCklda2XRUWmLg9wLOT1zDjycU~kk~2RkfZGYIlVVsWbbn0B0tWGBST77UHCQv-iwSYaPuLLDB7qs6QGuBS8TZPSxbi3-xke~AQhAWPg__'
    },
    {
      id: 3,
      nombre: 'Cacahuates',
      precio: '$10.00',
      unidades: '30',
      categoria: 'Frituras',
      vendedor: 'Luis Reyes',
      imagen: 'https://s3-alpha-sig.figma.com/img/23a2/de20/470b4614f8870ec61278cd5a58a43724?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=fOD1uUa9xYfByiqcWL3jX4hpH17BJUk~jM5aK0DQDkwIIIb~bPBYeU8PjTtv7tJS7o2yQEUEPOtL~rp5vlxT5yVuuzV7Nc08-35L3M7RMZr2pzmOdilSaqSKT7aVTMB~~jwjX8YjHEoxLohxQqse-z~Xiefo-sA6yiuWnkR2-L3Wa6EYnMsGBcKsLdPwkTjZ26CbX~mzQGWhANAzEzzdW9QN~JG4AwA3E1GOukL7tXWbeFCy~QA~KR3OC7-n8s4E710DLn4NQPB6OzjrpFVWn8JBquVybARt8qPdc61yJuICZ9xFTWsc1iyJo2onUqRn3tdQ9mtOdETz-Z9PTz0f-g__'
    },
    {
      id: 4,
      nombre: 'Pay de queso',
      precio: '$25.00',
      unidades: '8',
      categoria: 'Postres',
      vendedor: 'Ariel Suarez',
      imagen: 'https://s3-alpha-sig.figma.com/img/8c30/449f/215c9fca213b695502893d25269da5ef?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=dqsAPkrgEz~mQ5Gq1siYPtFg-WXpa6OSWTSochQrL6gH48GftKE9GwR5MqTZ6NOJ3VyS-~LfT4pzl3yg0cb9QY1uTVtR7rxYLhLAiHl9OM5jBAAddnho6744Qn7Ys0cZjvJD-hl4CTZK0E~Rqw7yGZ2MTDtHJRTFS3fAsBAQfulh1gp6WmJI6CUXPHGizVktuFe-45qeKWhjQm5M5X779AL~ERrB4bQoioxBXfBAzKolw0j5ktM8RRdYEnj~ebYBzCus~QUiNvoiyie-VM8ilWxl9taje6nxDjQrVYDSZo8Gmi9cPEVyLF1H9qs1awXWwSL1-W0hIcxndxR5XYCJpg__'
    },
  ]);

  const addProduct = (product) => {
    setProducts((prevProducts) => [...prevProducts, product]);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
};