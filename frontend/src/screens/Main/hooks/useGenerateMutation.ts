import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axios from "../../../util/axios";

export type GenerateResponse = {
  died: string;
  diedDate: string;
  born: string;
  bornDate: string;
  diedUrl: string;
  bornUrl: string;
  fileName: string;
};

type GenerateImageBody = {
  method: string;
};

type MessageResponse = {
  message: string;
};

export const useGenerateMutation = (
  options?: UseMutationOptions<
    GenerateResponse,
    AxiosError<MessageResponse>,
    GenerateImageBody
  >
) => {
  return useMutation({
    mutationKey: ["generateImage"],
    mutationFn: async (query) =>
      (await axios.get<GenerateResponse>("/generate", { params: query })).data,
    ...(options || {}),
  });
};
