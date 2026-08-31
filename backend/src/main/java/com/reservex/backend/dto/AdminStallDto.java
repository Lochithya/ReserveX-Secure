package com.reservex.backend.dto;

import com.reservex.backend.entity.Stall;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStallDto {
    private Integer id;
    private Integer exhibitionId;
    private String exhibitionName;
    private String name;
    private String size;
    private String type;
    private Double price;
    private Integer gridRow;
    private Integer gridCol;
    private Boolean isConfirmed;
    private Boolean isActive;
    private String description;
    private String reservedBy; // Vendor name if reserved

    public static AdminStallDto fromEntity(Stall stall, String reservedBy) {
        return AdminStallDto.builder()
                .id(stall.getId())
                .exhibitionId(stall.getExhibition() != null ? stall.getExhibition().getId() : null)
                .exhibitionName(stall.getExhibition() != null ? stall.getExhibition().getName() : null)
                .name(stall.getName())
                .size(stall.getSize() != null ? stall.getSize().name() : null)
                .type(stall.getType())
                .price(stall.getPrice())
                .gridRow(stall.getGridRow())
                .gridCol(stall.getGridCol())
                .isConfirmed(stall.getIsConfirmed())
                .isActive(stall.getIsActive())
                .description(stall.getDescription())
                .reservedBy(reservedBy)
                .build();
    }
}
