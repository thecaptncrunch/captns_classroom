import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CaptnsClassroom } from "../target/types/captns_classroom";
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { assert } from "chai";
import crypto from "crypto";

const GRADE_SEED = "NEW_GRADES";
const STUDENT_SEED = "NEW_STUDENT"; 

describe("captns_classroom", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CaptnsClassroom as Program<CaptnsClassroom>;

  // three students 
  const alyssa = anchor.web3.Keypair.generate();
  const marnie = anchor.web3.Keypair.generate();
  const vee = anchor.web3.Keypair.generate();

  // establish student first names
  const alyssa_firstname = "Alyssa";
  const marnie_firstname = "Marnie";
  const vee_firstname = "Vee";

  // name test cases
  const empty_name = "";
  const character_name = "🍅";
  const repeat_name = "Alyssa";
  const single_character = "N";

  // establish student grades
  const alyssa_midterm1 = 187.5;
  const alyssa_final1 = 100.0;
  const alyssa_homeworka1 = 73.7;
  const alyssa_homeworkb1 = 4.2;

  const alyssa_midterm2 = 57.0;
  const alyssa_final2 = 144.0;
  const alyssa_homeworka2 = 82.5;
  const alyssa_homeworkb2 = 43.2;

  const alyssa_midterm3 = 56.0;
  const alyssa_final3 = 12.0;
  const alyssa_homeworka3 = 232.5;
  const alyssa_homeworkb3 = 76.2;

  const alyssa_midterm4 = 78.0;
  const alyssa_final4 = 92.0;
  const alyssa_homeworka4 = 82.5;
  const alyssa_homeworkb4 = 231.2;

  const alyssa_midterm5 = 88.0;
  const alyssa_final5 = 92.0;
  const alyssa_homeworka5 = 82.5;
  const alyssa_homeworkb5 = 43.2;

  const marnie_midterm1 = 3.5;
  const marnie_final1 = 78.0;
  const marnie_homeworka1 = 100.0;
  const marnie_homeworkb1 = 89.2;

  const marnie_midterm2 = 56.5;
  const marnie_final2 = 0.6;
  const marnie_homeworka2 = 99.7;
  const marnie_homeworkb2 = 89.2;

  const marnie_midterm3 = 56.5;
  const marnie_final3 = 56.6;
  const marnie_homeworka3 = 4.7;
  const marnie_homeworkb3 = 89.2;

  const marnie_midterm4 = 56.5;
  const marnie_final4 = 5.0;
  const marnie_homeworka4 = 99.7;
  const marnie_homeworkb4 = 2.2;

  const marnie_midterm5 = 56.5;
  const marnie_final5 = 56.6;
  const marnie_homeworka5 = 99.7;
  const marnie_homeworkb5 = 89.2;

  const vee_midterm = 56.5;
  const vee_final = 78.0;
  const vee_homeworka = 99.7;
  const vee_homeworkb = 89.2;

describe("Create students", async () => {

  it("Should successfully create a new student", async () => {
    await airdrop(provider.connection, alyssa.publicKey);
    const [student_pkey, student_bump] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);

    await program.methods.createStudent(alyssa_firstname).accounts( 
      {
        studentIdentifier: alyssa.publicKey,
      }
    ).signers([alyssa]).rpc({ commitment: "confirmed" })
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
  
  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

})

});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

function getStudentAcctAddress(first_name: string, student: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(first_name),
      anchor.utils.bytes.utf8.encode(STUDENT_SEED),
      student.toBuffer()
    ], programID);
}

async function checkStudent(
  program: anchor.Program<CaptnsClassroom>,
  student_id: PublicKey,
  first_name: string,
  final_grade: number,
  bump: number,
) {
  let studentData = await program.account.student.fetch(student);

  if (student_id) {
    assert.strictEqual(studentData.studentId.toString(), student_id.toString(), `Tweet author should be ${tweet_author.toString()} but was ${tweetData.tweetAuthor.toString()}`)
  }
  if (first_name) {
    assert.strictEqual(studentData.firstName, first_name, `First name should be "${topic}" but was "${tweetData.topic}"`);
  }
  if (final_grade) {
    assert.strictEqual(studentData.finalGrade, final_grade, `Final grade should be "${content}" but was "${tweetData.content}"`);
  }
  if (bump) {
     assert.strictEqual(studentData.bump.toString(), bump.toString(), `Tweet bump should be ${bump} but was ${tweetData.bump}`)
  }

}
