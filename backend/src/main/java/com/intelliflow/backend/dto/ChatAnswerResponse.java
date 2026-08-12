package com.intelliflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ChatAnswerResponse {
    private String answer;
    private List<ChatSourceResponse> sources;
}
