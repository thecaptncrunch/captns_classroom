use anchor_lang::{prelude::*};

use crate::states::*;

pub fn delete_student(_ctx: Context<DeleteStudent>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteStudent<'info> {
    #[account(mut)]
    student_identifier: Signer<'info>,

    #[account(
        mut,
        close = student_identifier,
        seeds = [student.first_name.as_bytes(), STUDENT_SEED.as_bytes(), student.student_id.key().as_ref()],
        bump
    )]
    pub student: Account<'info, Student>,
}