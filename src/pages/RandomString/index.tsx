import { Input, Select } from "antd";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";

import { useAppDispatch, useAppSelector } from "@/store";
import { setRs_state } from "@/store/appSlice";
import { bulkGenerateSecureStrings } from "@/utils";

const { TextArea } = Input;

const InputEvent = styled(Input)`
  width: 200px;
  height: 40px;
`;
const SelectEvent = styled(Select)`
  width: 200px;
  height: 40px;
`;

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
  flex-direction: column;
  gap: 20px;
`;
const TextAreaInput = styled(TextArea)`
  width: 58vw;
  font-size: 16px;
`;
const ButtonContent = styled.div`
  display: flex;
  gap: 15px;
`;
const Button = styled.div<{ $enble?: boolean }>`
  background: ${(props) => (props.$enble ? "#a4a9b0ff" : "#1677ff")};
  border-radius: 12px;
  padding: 0 20px;
  cursor: pointer;

  font-size: 18px;
  color: #ffffff;
  font-weight: 400;
  line-height: 40px;
  text-align: center;

  &:hover {
    opacity: 0.8;
  }
`;

const RandomString: FC = () => {
  const dispatch = useAppDispatch();
  const rs = useAppSelector((state) => state.app.rs);

  const [prefix, setPrefix] = useState<string>("");
  const [strLength, setStrLength] = useState<number>(15);
  const [groups, setGroups] = useState<number>(1);
  const [type, setType] = useState<number>(0);
  const [shuffleValue, setShuffleValue] = useState<string | string[]>("");

  useEffect(() => {
    if (rs.prefix) {
      setPrefix(rs.prefix);
    }
    if (rs.strLength) {
      setStrLength(rs.strLength);
    }
    if (rs.groups) {
      setGroups(rs.groups);
    }
    if (rs.type) {
      setType(rs.type);
    }
    if (rs.shuffleValue) {
      setShuffleValue(rs.shuffleValue);
    }
  }, []);

  const handleSingleGroup = () => {
    if (groups === 1) {
      const result = bulkGenerateSecureStrings(strLength, 1, prefix, type);
      dispatch(
        setRs_state({
          prefix,
          strLength,
          groups,
          type,
          shuffleValue: result,
        }),
      );
      setShuffleValue(result);
      return;
    }
    const result = bulkGenerateSecureStrings(strLength, groups, prefix, type) as string[];
    dispatch(
      setRs_state({
        prefix,
        strLength,
        groups,
        type,
        shuffleValue: result.join("\n"),
      }),
    );
    setShuffleValue(result.join("\n"));
  };

  return (
    <Container>
      <Title>随机字符串</Title>
      <Content>
        <ButtonContent>
          <InputEvent
            placeholder='输入字符作为前缀'
            onChange={(e) => setPrefix(e?.target.value)}
            value={prefix}
          />
          <InputEvent
            type='number'
            placeholder='输入单组字符长度'
            maxLength={3}
            onChange={(e) => setStrLength(Number(e?.target.value ?? 15))}
            value={strLength}
          />
          <InputEvent
            type='number'
            placeholder='输入生成的组数'
            maxLength={4}
            onChange={(e) => setGroups(Number(e?.target.value ?? 1))}
            value={groups}
          />
          <SelectEvent
            value={type}
            options={[
              { label: "随机", value: 0 },
              { label: "字母", value: 1 },
              { label: "数字", value: 2 },
            ]}
            onChange={(value) => setType(Number(value))}
            placeholder='请选择'
            style={{ width: 200 }}
          />
          <Button onClick={() => handleSingleGroup()}>随机生成</Button>
        </ButtonContent>
        <TextAreaInput value={shuffleValue} readOnly rows={30} />
      </Content>
    </Container>
  );
};

export default RandomString;
