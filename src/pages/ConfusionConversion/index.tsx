import { Form, Input, Select } from "antd";
import * as cheerio from "cheerio";
import { FC, useEffect } from "react";
import styled from "styled-components";

import { useAppDispatch, useAppSelector } from "@/store";
import { setCc_state } from "@/store/appSlice";

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
const InputEvent = styled(Input)`
  width: 200px;
  height: 40px;
`;
const SelectEvent = styled(Select)`
  width: 200px;
  height: 40px;
`;

const ConfusionConversion: FC = () => {
  const dispatch = useAppDispatch();
  const cc = useAppSelector((state) => state.app.cc);
  const [form] = Form.useForm();

  useEffect(() => {
    if (cc.result) {
      form.setFieldsValue(cc);
    }
  }, []);

  const handleSubmit = async () => {
    const formValue = await form.validateFields();

    try {
      // 请求数据, FormData
      const formData = new FormData();
      // 当前混淆转到另一个混淆
      formData.append("project", formValue.confuseKey);
      // 转义 0，反转义 1。一个混淆转另一个时，忽略
      formData.append("reverse", formValue.type);
      // 混淆数据
      formData.append("origin", formValue.subValue);

      const res = await fetch("decode", {
        method: "POST",
        body: formData,
      });
      const html = await res.text();
      const $ = cheerio.load(html);
      const result = $("#right textarea").text();

      form.setFieldsValue({
        result: result,
      });
      dispatch(setCc_state({ ...formValue, result: result }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Title>混淆转换</Title>
      <FormEvent form={form} autoComplete='off' initialValues={{ type: 0 }}>
        <ButtonContent>
          <Form.Item name='confuseKey' rules={[{ required: true, message: "请输入混淆key" }]}>
            <InputEvent placeholder='例如：ph_vamo' />
          </Form.Item>
          <Form.Item name='type'>
            <SelectEvent
              options={[
                { label: "转义", value: 0 },
                { label: "反转义", value: 1 },
              ]}
              placeholder='请选择混淆类型'
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
            <TextAreaInput readOnly rows={30} />
          </Form.Item>
        </Content>
      </FormEvent>
    </Container>
  );
};

export default ConfusionConversion;
