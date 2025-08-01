import { Form, Input, Select } from "antd";
import * as cheerio from "cheerio";
import { FC, useEffect } from "react";
import styled from "styled-components";

import { useAppDispatch, useAppSelector } from "@/store";
import { setEd_state } from "@/store/appSlice";

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

const EncryptioAndDecryption: FC = () => {
  const dispatch = useAppDispatch();
  const ed = useAppSelector((state) => state.app.ed);
  const [form] = Form.useForm();

  useEffect(() => {
    if (ed.result) {
      form.setFieldsValue(ed);
    }
  }, []);

  const handleSubmit = async () => {
    const formValue = await form.validateFields();

    try {
      const formData = new FormData();
      formData.append("project", formValue.confuseKey);
      formData.append("reverse", formValue.type);
      formData.append("count", formValue.count);
      formData.append("origin", formValue.subValue);

      const res = await fetch("decrypt", {
        method: "POST",
        body: formData,
      });
      const html = await res.text();
      const $ = cheerio.load(html);
      const result = $("#right textarea").text();
      const dstRight = $("#dstRight textarea").text();

      form.setFieldsValue({
        result: result,
        dstRight: dstRight,
      });
      dispatch(setEd_state({ ...formValue, result, dstRight }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Title>加密解密</Title>
      <FormEvent form={form} autoComplete='off' initialValues={{ type: 0, count: 1 }}>
        <ButtonContent>
          <Form.Item name='confuseKey' rules={[{ required: true, message: "请输入key" }]}>
            <InputEvent placeholder='例如：ph_vamo' />
          </Form.Item>
          <Form.Item name='type'>
            <SelectEvent
              options={[
                { label: "加密", value: 0 },
                { label: "解密", value: 1 },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name='count'>
            <SelectEvent
              options={[
                { label: "1", value: 1 },
                { label: "2", value: 2 },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Button onClick={() => handleSubmit()}>执行</Button>
        </ButtonContent>
        <Content>
          <Form.Item name='subValue' rules={[{ required: true, message: "请输入" }]}>
            <TextAreaInput rows={25} />
          </Form.Item>
          <Form.Item name='result'>
            <TextAreaInput readOnly rows={25} />
          </Form.Item>
        </Content>
        <Form.Item name='dstRight'>
          <TextAreaInput readOnly rows={20} />
        </Form.Item>
      </FormEvent>
    </Container>
  );
};

export default EncryptioAndDecryption;
