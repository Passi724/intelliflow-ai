package com.intelliflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SearchResultResponse {
    private String documentId;
    private String filename;
    private int chunkIndex;
    private String text;
    private double score;
}
