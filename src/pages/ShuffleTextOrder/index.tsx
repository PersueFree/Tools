import { Input } from "antd";
import { ChangeEvent, FC, useState } from "react";
import styled from "styled-components";

import { Message } from "@/components";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSt_state } from "@/store/appSlice";

const { TextArea } = Input;

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
  padding: 10px 20px;
  cursor: pointer;

  font-size: 18px;
  color: #ffffff;
  font-weight: 400;
  text-align: center;

  &:hover {
    opacity: 0.8;
  }
`;

const ShuffleTextOrder: FC = () => {
  const dispatch = useAppDispatch();
  const st = useAppSelector((state) => state.app.st);

  const [value, setValue] = useState<string>(st.value ?? "");
  const [shuffleValue, setShuffleValue] = useState<string>(st.shuffleValue ?? "");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e?.target?.value || "");
    // dispatch(setSt_state({ value: e?.target?.value || "" }));
  };

  const handleClickCopy = async (str: string) => {
    if (!str) return;
    const textarea = document.createElement("textarea");
    textarea.value = str;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.setAttribute("readonly", "");

    document.body.appendChild(textarea);

    // 选择文本内容
    textarea.select();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(str);
        Message.success("success");
        return;
      }

      const successful = document.execCommand("copy");
      if (!successful) {
        throw new Error("复制失败");
      }
      Message.success("success");
    } catch (error) {
      console.log(error);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleShuffle = (text?: string) => {
    if (!text) return;
    const chars: string[] = [...text];
    let currentIndex: number = chars.length;
    while (currentIndex) {
      const randomIndex: number = Math.floor(Math.random() * currentIndex--);
      const temp: string = chars[currentIndex];
      chars[currentIndex] = chars[randomIndex];
      chars[randomIndex] = temp;
    }

    setShuffleValue(chars.join(""));
    dispatch(setSt_state({ value: text, shuffleValue: chars.join("") }));
  };

  const handleClear = () => {
    setValue("");
    setShuffleValue("");
    dispatch(setSt_state({}));
  };

  return (
    <Container>
      <Title>随机文本顺序</Title>
      <Content>
        <TextAreaInput value={value} onChange={(e) => handleChange(e)} rows={6} />
        <ButtonContent>
          <Button onClick={() => handleShuffle(value)}>随机打乱顺序</Button>
          <Button $enble onClick={() => handleClear()}>
            清空
          </Button>
          <Button $enble onClick={() => handleClickCopy(shuffleValue)}>
            复制
          </Button>
        </ButtonContent>
        <TextAreaInput value={shuffleValue} readOnly rows={6} />
      </Content>
    </Container>
  );
};

export default ShuffleTextOrder;
