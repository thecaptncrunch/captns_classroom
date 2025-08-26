use anchor_lang::prelude::*;

pub const NAME_LENGTH: usize = 32;

pub const MIDTERM_WEIGHT: f32 = 0.3;
pub const FINAL_WEIGHT: f32 = 0.5;
pub const HOMEWORK_WEIGHT: f32 = 0.2;

pub const GRADE_SEED: &str = "NEW_GRADES";
pub const STUDENT_SEED: &str = "NEW_STUDENT";

#[account]
#[derive(InitSpace)]
pub struct Student {
    pub student_id: Pubkey,
    #[max_len(NAME_LENGTH)]
    pub first_name: String,
    pub final_grade: f32,
    pub bump: f32,
}

#[account]
#[derive(InitSpace)]
pub struct Grades {
    pub grader: Pubkey,
    #[max_len(NAME_LENGTH)]
    pub student: String,
    pub set_midterm: f32,
    pub set_final: f32,
    pub set_a: f32,
    pub set_b: f32,
    pub bump: f32,
}