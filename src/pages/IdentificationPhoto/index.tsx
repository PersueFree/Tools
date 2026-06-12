import { Image, Select } from "antd";
import { FC, useState } from "react";
import styled from "styled-components";

import { FLBImages } from "@/assets/images";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Title = styled.div`
  font-weight: bold;
  font-size: 25px;
  color: #000000;
`;
const Content = styled.div`
  display: flex;
  gap: 100px;
`;
const ImageContent = styled.div`
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;
const ImageEvent = styled(Image)`
  width: 200px;
`;
const ImageTitle = styled.div`
  font-weight: bold;
  font-size: 25px;
  color: #000000;
`;
const SelectEvent = styled(Select)`
  width: 200px;
  height: 40px;
`;

interface ImageType {
  title: string;
  imgUrl: string;
}

const FLB: Array<ImageType> = [
  {
    title: "PASSPORT",
    imgUrl: FLBImages.PASSPORT,
  },
  {
    title: "PID",
    imgUrl: FLBImages.PID,
  },
  {
    title: "TIN",
    imgUrl: FLBImages.TIN,
  },
  {
    title: "UMID",
    imgUrl: FLBImages.UMID,
  },
];

const IdentificationPhoto: FC = () => {
  const [select, setSelect] = useState<Array<ImageType>>(FLB);
  const handleChange = (e: unknown) => {
    switch (e) {
      case "FLB":
        setSelect(FLB);
        break;
      case "YN":
        setSelect([]);
        break;
      case "VNM":
        setSelect([]);
        break;
    }
  };

  return (
    <Container>
      <Title>证件照</Title>
      <SelectEvent
        options={[
          { label: "菲律宾", value: "FLB" },
          { label: "印尼", value: "YN" },
          { label: "越南", value: "VNM" },
        ]}
        defaultValue={"FLB"}
        onChange={(e) => handleChange(e)}
        placeholder='请选择国家/地区'
        style={{ width: 300 }}
      />

      <Content>
        {select?.map((item, index) => (
          <ImageContent key={`${item.title}-${index}`}>
            <ImageEvent src={item.imgUrl} width={200} />
            <ImageTitle>{item.title}</ImageTitle>
          </ImageContent>
        ))}
      </Content>
    </Container>
  );
};

export default IdentificationPhoto;
