use anchor_lang::prelude::*;

#[event]
pub struct StudentEvent {
    pub student_id: Pubkey,
    pub first_name: String,
}

#[event]
pub struct GradeEvent {
    pub student_name: String,
}