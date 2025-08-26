#![allow(unexpected_cfgs)]

// I want to create a program that calculates student grades. 
// I want them to submit three grades:
// 1. Midterm score
// 2. Final score
// 3. Homework A score
// 4. Homework B score
//And for there to be a weighted score for each individual student
// I would also like there to be a class average
// The weights are 
// 1. 30% midterm
// 2. 50% final
// 3. 20% median homework
// Scores cannot be above 100 points, and cannot be below 5 points

use crate::instructions::*;
use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;
pub mod events;

declare_id!("4koFDYG9ymcJtV7RTjoheReoQECcLmdWdUJ5WfYPHE4T");

#[program]
pub mod captns_classroom {
    use super::*;

    pub fn create_student(ctx: Context<CreateStudent>, first_name: String) -> Result<()> {
        create_student(ctx, first_name)
    }
    pub fn delete_student(ctx: Context<DeleteStudent>, first_name: String) -> Result<()> {
        delete_student(ctx, first_name)
    }
    pub fn submit_grades(ctx: Context<SubmitGrades>, midterm: u8, _final: u8, homework_a: u8, homework_b: u8) -> Result<()> {
        submit_grades(ctx, midterm, _final, homework_a, homework_b)
    }
    pub fn delete_grades(ctx: Context<DeleteGrades>) -> Result<()> {
        delete_grades(ctx)
    }
}

