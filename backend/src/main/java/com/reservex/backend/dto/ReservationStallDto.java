package com.reservex.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ReservationStallDto {

    private Integer id;
    private String name;
    private String size;
    private String type;  // Standard, Premium, Corner Stall
    private String businessCategory;  // Business category for this stall
    private Double price;  // Reserved price
    private String description;
    private List<String> genres;
    private Integer gridRow;
    private Integer gridCol;
}
