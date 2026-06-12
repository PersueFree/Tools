import { Form, Input, Select } from "antd";
import { FC, useEffect } from "react";
import styled from "styled-components";

import { useAppDispatch, useAppSelector } from "@/store";
import { setJs_state } from "@/store/appSlice";

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
const FormEvent = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Content = styled.div`
  display: flex;
  gap: 20px;
`;
const TextAreaInput = styled(TextArea)`
  width: 39vw;
  font-size: 14px;
`;
const ButtonContent = styled.div`
  min-height: 40px;
  display: flex;
  gap: 15px;
`;
const Button = styled.div<{ $enble?: boolean }>`
  background: ${(props) => (props.$enble ? "#a4a9b0ff" : "#1677ff")};
  border-radius: 12px;
  padding: 0px 20px;
  cursor: pointer;
  height: 40px;

  font-size: 18px;
  color: #ffffff;
  font-weight: 400;
  line-height: 40px;
  text-align: center;

  &:hover {
    opacity: 0.8;
  }
`;
const SelectEvent = styled(Select)`
  width: 200px;
  height: 40px;
`;

const JSONEscape: FC = () => {
  const dispatch = useAppDispatch();
  const js = useAppSelector((state) => state.app.js);
  const [form] = Form.useForm();

  useEffect(() => {
    if (js.result) {
      form.setFieldsValue(js);
    }
  }, [form, js]);

  const handleSubmit = async () => {
    const formValue = await form.validateFields();

    try {
      let formatted = "";
      if (formValue.type === 0) {
        const jsonObject = JSON.parse(formValue.subValue.trim()); // trim()去除多余空格
        formatted = JSON.stringify(jsonObject, null, 2);
      } else {
        formatted = JSON.stringify(JSON.parse(formValue.subValue));
      }

      form.setFieldsValue({
        result: formatted,
      });
      dispatch(setJs_state({ ...formValue, result: formatted }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Title>JSON格式化</Title>
      <FormEvent form={form} autoComplete='off' initialValues={{ type: 0 }}>
        <ButtonContent>
          <Form.Item name='type'>
            <SelectEvent
              options={[
                { label: "格式化", value: 0 },
                { label: "压缩", value: 1 },
              ]}
              placeholder='请选择类型'
              style={{ width: 200 }}
            />
          </Form.Item>
          <Button onClick={() => handleSubmit()}>执行</Button>
        </ButtonContent>
        <Content>
          <Form.Item name='subValue' rules={[{ required: true, message: "请输入混淆数据" }]}>
            <TextAreaInput rows={30} />
          </Form.Item>
          <Form.Item name='result'>
            <TextAreaInput
              style={{
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                whiteSpace: "pre-wrap",
                overflow: "auto",
                resize: "vertical",
              }}
              readOnly
              rows={30}
            />
          </Form.Item>
        </Content>
      </FormEvent>
    </Container>
  );
};

export default JSONEscape;
