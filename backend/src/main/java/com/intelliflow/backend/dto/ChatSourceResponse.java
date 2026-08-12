package com.intelliflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatSourceResponse {
    private String documentId;
    private String filename;
    private int chunkIndex;
    private double score;
}
